package com.ayesa.tickets.dto;

import com.ayesa.tickets.domain.EstadoTicket;
import jakarta.validation.constraints.NotNull;

/** Cuerpo de PATCH /tickets/{id}/estado (cuando se arrastra una tarjeta en el Kanban). */
public record CambiarEstadoRequest(@NotNull EstadoTicket estado) {
}
