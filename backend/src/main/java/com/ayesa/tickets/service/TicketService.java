package com.ayesa.tickets.service;

import com.ayesa.tickets.domain.Cliente;
import com.ayesa.tickets.domain.EstadoTicket;
import com.ayesa.tickets.domain.Ticket;
import com.ayesa.tickets.domain.Usuario;
import com.ayesa.tickets.dto.TicketRequest;
import com.ayesa.tickets.repository.ClienteRepository;
import com.ayesa.tickets.repository.TicketRepository;
import com.ayesa.tickets.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository tickets;
    private final ClienteRepository clientes;
    private final UsuarioRepository usuarios;

    public TicketService(TicketRepository tickets, ClienteRepository clientes, UsuarioRepository usuarios) {
        this.tickets = tickets;
        this.clientes = clientes;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<Ticket> listar() {
        return tickets.findAll();
    }

    @Transactional
    public Ticket crear(TicketRequest r) {
        if (tickets.existsByCodigoExternoIgnoreCase(r.codigoExterno().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un ticket con ese código");
        }
        Ticket t = new Ticket();               // estado PENDIENTE y fechaCreacion por defecto
        aplicar(t, r);
        return tickets.save(t);
    }

    @Transactional
    public Ticket actualizar(Long id, TicketRequest r) {
        Ticket t = buscar(id);
        if (tickets.existsByCodigoExternoIgnoreCaseAndIdNot(r.codigoExterno().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un ticket con ese código");
        }
        aplicar(t, r);
        return t;
    }

    @Transactional
    public Ticket cambiarEstado(Long id, EstadoTicket estado) {
        Ticket t = buscar(id);
        asignarEstado(t, estado);
        return t;
    }

    private Ticket buscar(Long id) {
        return tickets.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket no encontrado"));
    }

    /** Copia los datos del request al ticket aplicando las validaciones de negocio. */
    private void aplicar(Ticket t, TicketRequest r) {
        if (r.fechaEntregaInterna() != null && r.fechaEntregaCliente() != null
                && r.fechaEntregaCliente().isBefore(r.fechaEntregaInterna())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha cliente no puede ser anterior a la interna");
        }

        String nombreCliente = r.cliente().trim();
        Cliente cliente = clientes.findByNombreIgnoreCase(nombreCliente)
                .orElseGet(() -> clientes.save(new Cliente(nombreCliente)));

        Usuario asignado = null;
        if (r.usuarioAsignadoId() != null) {
            asignado = usuarios.findById(r.usuarioAsignadoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El consultor no existe"));
        }

        t.setCodigoExterno(r.codigoExterno().trim());
        t.setTitulo(r.titulo().trim());
        t.setTipo(r.tipo());
        t.setCliente(cliente);
        t.setUsuarioAsignado(asignado);
        t.setHorasEstimadas(r.horasEstimadas());
        t.setFechaEntregaInterna(r.fechaEntregaInterna());
        t.setFechaEntregaCliente(r.fechaEntregaCliente());
        t.setPrioridad(blankToNull(r.prioridad()));
        t.setProyecto(blankToNull(r.proyecto()));
        t.setDescripcion(blankToNull(r.descripcion()));
        if (r.estado() != null) {
            asignarEstado(t, r.estado());
        }
    }

    private void asignarEstado(Ticket t, EstadoTicket nuevo) {
        if (nuevo == EstadoTicket.CERRADO) {
            if (t.getFechaCierre() == null) t.setFechaCierre(LocalDate.now());
        } else {
            t.setFechaCierre(null);            // si se reabre, deja de estar cerrado
        }
        t.setEstado(nuevo);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
