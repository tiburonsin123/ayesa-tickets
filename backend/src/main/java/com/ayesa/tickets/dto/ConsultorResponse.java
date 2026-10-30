package com.ayesa.tickets.dto;

import com.ayesa.tickets.domain.Usuario;

public record ConsultorResponse(Long id, String nombre, String equipo) {
    public static ConsultorResponse from(Usuario u) {
        return new ConsultorResponse(u.getId(), u.getNombre(), u.getEquipo());
    }
}
