package com.ayesa.tickets.web;

import com.ayesa.tickets.domain.Cliente;
import com.ayesa.tickets.domain.Rol;
import com.ayesa.tickets.domain.Ticket;
import com.ayesa.tickets.dto.ConsultorResponse;
import com.ayesa.tickets.repository.ClienteRepository;
import com.ayesa.tickets.repository.TicketRepository;
import com.ayesa.tickets.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

/** Listas que el frontend usa en filtros y formularios. */
@RestController
public class CatalogoController {

    private final ClienteRepository clientes;
    private final UsuarioRepository usuarios;
    private final TicketRepository tickets;

    public CatalogoController(ClienteRepository clientes, UsuarioRepository usuarios, TicketRepository tickets) {
        this.clientes = clientes;
        this.usuarios = usuarios;
        this.tickets = tickets;
    }

    /** El frontend espera un arreglo de textos: ["Toyota", "Enel", ...] */
    @GetMapping("/clientes")
    public List<String> clientes() {
        return clientes.findAll().stream().map(Cliente::getNombre).sorted().toList();
    }

    @GetMapping("/consultores")
    public List<ConsultorResponse> consultores() {
        return usuarios.findByRol(Rol.CONSULTOR).stream().map(ConsultorResponse::from).toList();
    }

    /** Por ahora "proyecto" es solo texto del ticket; se devuelven los distintos usados. */
    @GetMapping("/proyectos")
    public List<String> proyectos() {
        return tickets.findAll().stream().map(Ticket::getProyecto).filter(Objects::nonNull).distinct().sorted().toList();
    }
}
