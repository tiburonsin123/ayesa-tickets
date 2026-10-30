package com.ayesa.tickets.web;

import com.ayesa.tickets.dto.CambiarEstadoRequest;
import com.ayesa.tickets.dto.TicketRequest;
import com.ayesa.tickets.dto.TicketResponse;
import com.ayesa.tickets.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de tickets. El frontend los llama como http://localhost:8080/api/tickets
 * TODO (cuando exista el login con JWT): solo COORDINADOR puede crear/editar (@PreAuthorize),
 * y GET /tickets/mis devuelve únicamente los tickets del usuario autenticado.
 */
@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    @GetMapping
    public List<TicketResponse> listar() {
        return service.listar().stream().map(TicketResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse crear(@Valid @RequestBody TicketRequest req) {
        return TicketResponse.from(service.crear(req));
    }

    @PutMapping("/{id}")
    public TicketResponse actualizar(@PathVariable Long id, @Valid @RequestBody TicketRequest req) {
        return TicketResponse.from(service.actualizar(id, req));
    }

    @PatchMapping("/{id}/estado")
    public TicketResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest req) {
        return TicketResponse.from(service.cambiarEstado(id, req.estado()));
    }
}
