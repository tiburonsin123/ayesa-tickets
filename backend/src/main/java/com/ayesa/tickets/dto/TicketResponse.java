package com.ayesa.tickets.dto;

import com.ayesa.tickets.domain.EstadoTicket;
import com.ayesa.tickets.domain.Ticket;
import com.ayesa.tickets.domain.TipoTicket;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Forma exacta que espera el frontend (mismos nombres de campo). */
public record TicketResponse(
        Long id,
        String codigoExterno,
        String titulo,
        TipoTicket tipo,
        EstadoTicket estado,
        String cliente,
        Long usuarioAsignadoId,
        BigDecimal horasEstimadas,
        BigDecimal horasConsumidas,
        LocalDate fechaEntregaInterna,
        LocalDate fechaEntregaCliente,
        String prioridad,
        String proyecto,
        String descripcion,
        String ultimoComentario,
        LocalDate fechaCreacion,
        LocalDate fechaCierre
) {
    public static TicketResponse from(Ticket t) {
        return new TicketResponse(
                t.getId(),
                t.getCodigoExterno(),
                t.getTitulo(),
                t.getTipo(),
                t.getEstado(),
                t.getCliente().getNombre(),
                t.getUsuarioAsignado() != null ? t.getUsuarioAsignado().getId() : null,
                t.getHorasEstimadas(),
                t.getHorasConsumidas(),
                t.getFechaEntregaInterna(),
                t.getFechaEntregaCliente(),
                t.getPrioridad(),
                t.getProyecto(),
                t.getDescripcion(),
                t.getUltimoComentario(),
                t.getFechaCreacion(),
                t.getFechaCierre()
        );
    }
}
