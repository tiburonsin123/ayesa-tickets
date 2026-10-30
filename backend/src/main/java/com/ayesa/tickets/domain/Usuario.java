package com.ayesa.tickets.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    /** TODO: guardar hash (BCrypt) cuando se implemente el login. Por ahora es solo dato de prueba. */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    /** Equipo del consultor (EAM, ABAP, CPI...). Lo usa el filtro "Mis Equipos" del frontend. */
    @Column(length = 40)
    private String equipo;

    public Usuario(String nombre, String email, String password, Rol rol, String equipo) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.equipo = equipo;
    }
}
