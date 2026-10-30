package com.ayesa.tickets.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tickets")
@Getter @Setter @NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Código que viene del cliente o de Jira (JIRA-504, TOYOTA-12). No es autoincremental. */
    @Column(name = "codigo_externo", nullable = false, unique = true, length = 40)
    private String codigoExterno;

    /** Nombre / descripción corta. */
    @Column(nullable = false, length = 120)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTicket tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoTicket estado = EstadoTicket.PENDIENTE;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    /** Un solo responsable en el MVP. Puede ser null (ticket sin asignar). */
    @ManyToOne
    @JoinColumn(name = "usuario_asignado_id")
    private Usuario usuarioAsignado;

    // ---- Opcionales: el coordinador los completa después de crear el ticket ----
    @Column(name = "horas_estimadas")
    private BigDecimal horasEstimadas;

    /** Se irá sumando con las horas reales que registren los consultores (pendiente). */
    @Column(name = "horas_consumidas", nullable = false)
    private BigDecimal horasConsumidas = BigDecimal.ZERO;

    @Column(name = "fecha_entrega_interna")
    private LocalDate fechaEntregaInterna;

    @Column(name = "fecha_entrega_cliente")
    private LocalDate fechaEntregaCliente;

    @Column(length = 10)
    private String prioridad;

    @Column(length = 80)
    private String proyecto;

    @Column(length = 2000)
    private String descripcion;

    @Column(name = "ultimo_comentario", length = 120)
    private String ultimoComentario;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion = LocalDate.now();

    /** Se llena al pasar a CERRADO. El Kanban oculta los cerrados hace más de 7 días, pero no se borran. */
    @Column(name = "fecha_cierre")
    private LocalDate fechaCierre;
}
