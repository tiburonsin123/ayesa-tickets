package com.ayesa.tickets.dto;

import com.ayesa.tickets.domain.EstadoTicket;
import com.ayesa.tickets.domain.TipoTicket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Cuerpo de POST /tickets y PUT /tickets/{id}.
 * Obligatorios al crear: codigoExterno, tipo, titulo y cliente. Todo lo demás es opcional.
 */
public record TicketRequest(
        @NotBlank @Size(max = 40) String codigoExterno,
        @NotBlank @Size(max = 120) String titulo,
        @NotNull TipoTicket tipo,
        @NotBlank @Size(max = 80) String cliente,
        EstadoTicket estado,
        Long usuarioAsignadoId,
        @Positive BigDecimal horasEstimadas,
        LocalDate fechaEntregaInterna,
        LocalDate fechaEntregaCliente,
        @Size(max = 10) String prioridad,
        @Size(max = 80) String proyecto,
        @Size(max = 2000) String descripcion
) {
}
