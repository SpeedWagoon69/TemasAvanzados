import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoTecNM from "./assets/logoTecNM.png";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dqmbtidomzvhprovovyy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWJ0aWRvbXp2aHByb3Zvdnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgwOTUsImV4cCI6MjA1ODYwNDA5NX0.WU_NJH-XkC7Xi_uaWceZpMpZkZaujeX5L-L1RsbUDsg"
);

const LoginScreen = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [claveAcceso, setClaveAcceso] = useState("");
  const [matricula, setMatricula] = useState("");
  const [claveEstudiante, setClaveEstudiante] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isAdminSelected, setIsAdminSelected] = useState(true); // Estado para controlar el color

  
  const handleAdminLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.rpc(
        "verificar_credenciales",
        {
          p_usuario: numeroEmpleado,
          p_password: claveAcceso,
        }
      );

      if (authError) throw authError;

      if (data && data.length > 0) {
        localStorage.setItem("token", data[0].token);
        navigate("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const credentials = {
        p_alumno_id: parseInt(matricula), // nuevo nombre del parámetro
        p_password_input: claveEstudiante, // nuevo nombre del parámetro
      };

      const { data, error: authError } = await supabase.rpc(
        "verificar_credenciales_alumno",
        credentials
      );

      if (authError) throw authError;

      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem("token", data[0].token);
        navigate("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginContainer}>
        <img src={logoTecNM} alt="Logo TecNM" style={styles.logo} />
        <h2 style={styles.subtitle}>LIBRARY SYSTEM</h2>

        {/* Toggle Switch con animación */}
        <div style={styles.toggleWrapper}>
          <div style={styles.toggleContainer}>
            <div
              style={{
                ...styles.toggleSlider,
                transform: isAdmin ? "translateX(0)" : "translateX(100%)",
              }}
            />
            <button
            style={{
              ...styles.toggleButton,
              color: isAdminSelected ? "#fff" : "#1B396A", // Cambia el color cuando es admin
            }}
            onClick={() => {
              setIsAdmin(true);
              setIsAdminSelected(true); // Cambia el estado para admin
            }}
          >
            Admin
          </button>
          <button
            style={{
              ...styles.toggleButton,
              color: !isAdminSelected ? "#fff" : "#1B396A", // Cambia el color cuando es student
            }}
            onClick={() => {
              setIsAdmin(false);
              setIsAdminSelected(false); // Cambia el estado para student
            }}
          >
            Student
          </button>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Contenedor de formularios con animación */}
        <div style={styles.formContainer}>
          <div
            style={{
              ...styles.formWrapper,
              transform: isAdmin ? "rotateY(0deg)" : "rotateY(180deg)",
            }}
          >
            {/* Formulario Administrativo */}
            <div style={styles.formCard}>
              <input
                type="text"
                placeholder="User"
                style={styles.input}
                value={numeroEmpleado}
                onChange={(e) => setNumeroEmpleado(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                style={styles.input}
                value={claveAcceso}
                onChange={(e) => setClaveAcceso(e.target.value)}
              />
              <button
                style={styles.button}
                onClick={handleAdminLogin}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Log In"}
              </button>
            </div>

            {/* Formulario Alumnos (girado) */}
            <div style={styles.formCardBack}>
              <input
                type="text"
                placeholder="Number"
                style={styles.input}
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                style={styles.input}
                value={claveEstudiante}
                onChange={(e) => setClaveEstudiante(e.target.value)}
              />
              <button
                style={styles.button}
                onClick={handleStudentLogin}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Log In"}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#1B396A",
  },
  loginContainer: {
    width: "85%",
    maxWidth: "500px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "50px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    position: "relative",
    overflow: "hidden",
  },
  logo: {
    width: "70%",
    maxWidth: "430px",
    height: "auto",
    marginBottom: "40px",
  },
  subtitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "26px",
    textAlign: "center",
    color: "#1B396A",
  },
  toggleWrapper: {
    width: "100%",
    marginBottom: "30px",
  },
  toggleContainer: {
    position: "relative",
    width: "200px",
    height: "40px",
    backgroundColor: "#f0f0f0",
    borderRadius: "20px",
    margin: "0 auto",
    display: "flex",
  },
  toggleSlider: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#1B396A",
    borderRadius: "20px",
    transition: "transform 0.3s ease",
  },
  toggleButton: {
    flex: 1,
    border: "none",
    background: "transparent",
    color: "#1B396A",
    fontWeight: "600",
    cursor: "pointer",
    zIndex: 1,
    transition: "color 0.3s ease",
  },
  formContainer: {
    perspective: "1000px",
    width: "100%",
    height: "170px",
    marginBottom: "20px",
  },
  formWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
    transition: "transform 0.6s",
    transformStyle: "preserve-3d",
  },
  formCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  formCardBack: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    transform: "rotateY(180deg)",
  },
  input: {
    width: "100%",
    height: "42px",
    border: "1px solid #1B396A",
    borderRadius: "5px",
    padding: "0 10px",
    marginBottom: "25px",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  error: {
    color: "#ff0000",
    marginBottom: "20px",
    textAlign: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#1B396A",
    padding: "12px 0",
    borderRadius: "5px",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "30px",
  },
};

export default LoginScreen;
