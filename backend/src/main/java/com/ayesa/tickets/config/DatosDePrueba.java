package com.ayesa.tickets.config;

import com.ayesa.tickets.domain.Cliente;
import com.ayesa.tickets.domain.Rol;
import com.ayesa.tickets.domain.Usuario;
import com.ayesa.tickets.repository.ClienteRepository;
import com.ayesa.tickets.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Carga usuarios y clientes de ejemplo si la base está vacía (solo desarrollo). */
@Configuration
public class DatosDePrueba {

    @Bean
    CommandLineRunner cargar(UsuarioRepository usuarios, ClienteRepository clientes) {
        return args -> {
            if (usuarios.count() == 0) {
                usuarios.save(new Usuario("Pedro Castillo", "coordinador@ayesa.com", "1234", Rol.COORDINADOR, null));
                usuarios.save(new Usuario("Juan Pérez", "juan@ayesa.com", "1234", Rol.CONSULTOR, "EAM"));
                usuarios.save(new Usuario("María Gómez", "maria@ayesa.com", "1234", Rol.CONSULTOR, "ABAP"));
                usuarios.save(new Usuario("Luis Rojas", "luis@ayesa.com", "1234", Rol.CONSULTOR, "CPI"));
                usuarios.save(new Usuario("Ana Torres", "ana@ayesa.com", "1234", Rol.CONSULTOR, "ABAP"));
            }
            if (clientes.count() == 0) {
                clientes.save(new Cliente("Luz del Sur"));
                clientes.save(new Cliente("Enel"));
                clientes.save(new Cliente("Sedapal"));
            }
        };
    }
}
