package com.ventas.orders.service;

import com.ventas.orders.client.ProductClient;
import com.ventas.orders.dto.*;
import com.ventas.orders.entity.Order;
import com.ventas.orders.entity.OrderItem;
import com.ventas.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private final OrderRepository orderRepository;
    private final ProductClient productClient;

    public ApiResponse<java.util.List<OrderDTO>> getOrders(int page, int size, String status, String userEmail) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage;

        if (status != null && !status.isBlank()) {
            orderPage = orderRepository.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            orderPage = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        var orders = orderPage.getContent().stream().map(this::toDTO).toList();
        var pageInfo = new ApiResponse.PageInfo(
            orderPage.getNumber(), orderPage.getSize(),
            orderPage.getTotalElements(), orderPage.getTotalPages()
        );
        return ApiResponse.ok(orders, pageInfo);
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + id));
        return toDTO(order);
    }

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request, String userEmail) {
        Order order = new Order();
        order.setClientName(request.clientName());
        order.setClientEmail(request.clientEmail());
        order.setUserEmail(userEmail);
        order.setItems(new ArrayList<>());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            String productName;
            BigDecimal unitPrice;

            if (itemReq.productName() != null && itemReq.unitPrice() != null) {
                productName = itemReq.productName();
                unitPrice = itemReq.unitPrice();
            } else {
                ProductDTO product = productClient.getProduct(itemReq.productId());
                productName = product.name();
                unitPrice = product.price();
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(itemReq.productId());
            item.setProductName(productName);
            item.setQuantity(itemReq.quantity());
            item.setUnitPrice(unitPrice);
            item.setSubtotal(unitPrice.multiply(BigDecimal.valueOf(itemReq.quantity())));

            order.getItems().add(item);
            total = total.add(item.getSubtotal());
        }

        order.setTotal(total);
        Order saved = orderRepository.save(order);
        log.info("Orden #{} creada por {}", saved.getId(), userEmail);
        return toDTO(saved);
    }

    @Transactional
    public OrderDTO updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + id));
        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        Order updated = orderRepository.save(order);
        return toDTO(updated);
    }

    public ApiResponse<Map<String, Object>> getStats() {
        long pending = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long confirmed = orderRepository.countByStatus(Order.OrderStatus.CONFIRMED);
        long shipped = orderRepository.countByStatus(Order.OrderStatus.SHIPPED);
        long delivered = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);
        return ApiResponse.ok(Map.of(
            "pending", pending, "confirmed", confirmed,
            "shipped", shipped, "delivered", delivered, "cancelled", cancelled
        ));
    }

    private OrderDTO toDTO(Order o) {
        var items = o.getItems().stream().map(i ->
            new OrderItemDTO(i.getProductId(), i.getProductName(),
                i.getQuantity(), i.getUnitPrice(), i.getSubtotal())
        ).toList();
        return new OrderDTO(o.getId(), o.getClientName(), o.getClientEmail(),
            items, o.getStatus().name(), o.getTotal(),
            o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
    }
}
