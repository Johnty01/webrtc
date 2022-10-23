package com.demo.webrtc.configuration;

import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.io.IOException;
import java.util.logging.SocketHandler;

public class WebSocketConfiguration implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        try {
            registry.addHandler((WebSocketHandler) new SocketHandler(), "/socket")
                    .setAllowedOrigins("*");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
