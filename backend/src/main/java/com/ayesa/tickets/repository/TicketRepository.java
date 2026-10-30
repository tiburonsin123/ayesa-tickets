package com.ayesa.tickets.repository;

import com.ayesa.tickets.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    boolean existsByCodigoExternoIgnoreCase(String codigoExterno);

    boolean existsByCodigoExternoIgnoreCaseAndIdNot(String codigoExterno, Long id);
}
