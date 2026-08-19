package com.ventasplatform.service;

import com.ventasplatform.dto.*;
import com.ventasplatform.entity.Order;
import com.ventasplatform.entity.OrderItem;
import com.ventasplatform.entity.Product;
import com.ventasplatform.entity.User;
import com.ventasplatform.repository.OrderRepository;
import com.ventasplatform.repository.ProductRepository;
import com.ventasplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ApiResponse<java.util.List<OrderDTO>> getOrders(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage;

        if (status != null && !status.isBlank()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            orderPage = orderRepository.findByStatusOrderByCreatedAtDesc(orderStatus, pageable);
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
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Order order = new Order();
        order.setClientName(request.clientName());
        order.setClientEmail(request.clientEmail());
        order.setUser(user);
        order.setItems(new ArrayList<>());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemReq.productId()));

            if (product.getStock() < itemReq.quantity()) {
                throw new RuntimeException("Stock insuficiente para: " + product.getName());
            }

            product.setStock(product.getStock() - itemReq.quantity());
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());
            item.setUnitPrice(product.getPrice());
            item.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));

            order.getItems().add(item);
            total = total.add(item.getSubtotal());
        }

        order.setTotal(total);
        Order saved = orderRepository.save(order);
        log.info("Orden #{} creada por {}", saved.getId(), userEmail);
        notify("CREATED", toDTO(saved));
        return toDTO(saved);
    }

    @Transactional
    public OrderDTO updateStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + id));
        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        Order updated = orderRepository.save(order);
        notify("UPDATED", toDTO(updated));
        return toDTO(updated);
    }

    public ApiResponse<Map<String, Object>> getStats() {
        long pending = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long confirmed = orderRepository.countByStatus(Order.OrderStatus.CONFIRMED);
        long shipped = orderRepository.countByStatus(Order.OrderStatus.SHIPPED);
        long delivered = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        return ApiResponse.ok(Map.of(
            "pending", pending, "confirmed", confirmed,
            "shipped", shipped, "delivered", delivered
        ));
    }

    private void notify(String event, OrderDTO order) {
        messagingTemplate.convertAndSend("/topic/orders", Map.of("event", event, "order", order));
    }

    private OrderDTO toDTO(Order o) {
        var items = o.getItems().stream().map(i ->
            new OrderItemDTO(i.getProduct().getId(), i.getProduct().getName(),
                i.getQuantity(), i.getUnitPrice(), i.getSubtotal())
        ).toList();
        return new OrderDTO(o.getId(), o.getClientName(), o.getClientEmail(),
            items, o.getStatus().name(), o.getTotal(),
            o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
    }
}
