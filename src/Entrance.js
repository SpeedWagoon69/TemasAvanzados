import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import logoTecNM from "./assets/Logo_TecNM_Horizontal_Blanco.png";
import menu from "./assets/menu.png";
import user from "./assets/ic_user.png";

// Inicializa cliente Supabase (usa tus propias credenciales o variables de entorno)
const supabase = createClient(
  "https://dqmbtidomzvhprovovyy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWJ0aWRvbXp2aHByb3Zvdnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgwOTUsImV4cCI6MjA1ODYwNDA5NX0.WU_NJH-XkC7Xi_uaWceZpMpZkZaujeX5L-L1RsbUDsg"
);

const Entrance = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
        if (!token) navigate("/login", { replace: true });
  }, [navigate]);
  // Estado para entradas
  const [entradas, setEntradas] = useState([]);
  const [loadingEntradas, setLoadingEntradas] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id_alumno: "",
    nombre: "",
    carrera: "",
    asunto: "",
  });
  const [alumnos, setAlumnos] = useState([]);
  const [carreras, setCarreras] = useState([]);
  // Tipo de búsqueda
  const [query, setQuery] = useState("");
  const [filteredAlumnos, setFilteredAlumnos] = useState([]);
  useEffect(() => {
    const fetchCarreras = async () => {
      const { data, error } = await supabase
        .from("carreras")
        .select("id_carrera, nombre_carrera");

      if (error) {
        console.error("Error al cargar carreras:", error.message);
      } else {
        setCarreras(data);
      }
    };

    fetchCarreras();
  }, []);
  const menuItems = [
    { name: "Dashboard", subItems: null },
    {
      name: "Library",
      subItems: ["Books", "Generate Reports", "Loans"],
    },
    { name: "Personal", subItems: ["Students"] },
    { name: "Entry Register", subItems: null },
    { name: "Settings", subItems: [ "User"] },
    { name: "Log Out", subItems: null },
  ];

  const supportItems = [
    { name: "Soporte", subItems: null },
    { name: "Guía de uso", subItems: null },
  ];

  useEffect(() => {
    fetchEntradas();
    fetchAlumnos();
  }, []);

  const fetchEntradas = async () => {
    setLoadingEntradas(true);
    const { data, error } = await supabase.rpc("get_entradas");
    if (error) console.error("Error cargando entradas:", error);
    else setEntradas(data);
    setLoadingEntradas(false);
  };
  const fetchAlumnos = async () => {
    const { data, error } = await supabase
      .from("alumnos")
      .select("id_alumno, nombre, apellidos, id_carrera");
    if (error) console.error("Error cargando alumnos:", error);
    else setAlumnos(data);
  };
  useEffect(() => {
    if (query) {
      const lower = query.toLowerCase();
      setFilteredAlumnos(
        alumnos.filter(a =>
          String(a.id_alumno).startsWith(lower) ||
          (`${a.nombre} ${a.apellidos}`).toLowerCase().includes(lower)
        )
      );
    } else setFilteredAlumnos([]);
  }, [query, alumnos]);
  const toggleDropdown = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };
  const handleLogout = () => {
    if (window.confirm("¿Desea cerrar sesión?")) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };
  const handleMenuClick = (itemName) => {
    switch (itemName) {
      case "Dashboard":
        navigate("/dashboard");
        break;
      case "Books":
        navigate("/books");
        break;
      case "Generate Reports":
        navigate("/reports");
        break;
      case "Loans":
        navigate("/loans");
        break;
      case "Students":
        navigate("/students");
        break;
        case "User":
          navigate("/user");
          break;
      case "Log Out":
        handleLogout();
        break;
      default:
        break;
    }
  };
  // Maneja cambio de select alumno
  const handleSelectAlumno = (alumno) => {
    setFormData({
      id_alumno: String(alumno.id_alumno),
      nombre: `${alumno.nombre} ${alumno.apellidos}`,
      carrera: String(alumno.id_carrera),
      asunto: formData.asunto,
    });
    setQuery(String(alumno.id_alumno));
    setFilteredAlumnos([]);
  };
  const sidebarStyles = {
    ...styles.sidebar,
    left: isMenuVisible ? 0 : -300,
    transition: "left 0.3s ease",
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id_alumno') setQuery(value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const validAlumno = alumnos.some(a => String(a.id_alumno) === formData.id_alumno);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validAlumno) return;
    const { id_alumno, nombre, carrera, asunto } = formData;
    const { error } = await supabase.rpc("insertar_entrada", {
      _id_alumno: parseInt(id_alumno),
      _nombre: nombre,
      _id_carrera: parseInt(carrera),
      _asunto: asunto,
    });
    if (error) alert(`Error: ${error.message}`);
    else {
      alert("Entry registered successfully.");
      setShowModal(false);
      setFormData({ id_alumno: "", nombre: "", carrera: "", asunto: "" });
      setQuery("");
      fetchEntradas();
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.leftHeader}>
          <button
            style={{
              ...styles.button,
              backgroundColor: isMenuHovered
                ? "rgba(255, 255, 255, 0.1)"
                : "transparent",
            }}
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => setIsMenuHovered(false)}
            onClick={toggleMenu}
          >
            <img src={menu} alt="menu" style={styles.menuH} />
          </button>

          <img src={logoTecNM} alt="Logo TecNM" style={styles.logo} />
          <div style={styles.username}>LIBRARY SYSTEM</div>

          <button
            style={{
              ...styles.buttonUsr,
              backgroundColor: isUserHovered
                ? "rgba(255, 255, 255, 0.1)"
                : "transparent",
            }}
            onMouseEnter={() => setIsUserHovered(true)}
            onMouseLeave={() => setIsUserHovered(false)}
          >
            <img src={user} alt="user" style={styles.userimg} />
          </button>
        </div>
      </header>

      <nav style={sidebarStyles}>
        <div style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <div key={`${item.name}-${idx}`} style={styles.menuItem}>
              <div
                style={styles.menuMain}
                onClick={() =>
                  item.subItems
                    ? toggleDropdown(item.name)
                    : handleMenuClick(item.name)
                }
              >
                {item.name}
                {item.subItems && (
                  <span
                    style={{
                      ...styles.arrow,
                      transform:
                        activeDropdown === item.name
                          ? "rotate(180deg)"
                          : "none",
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
              {item.subItems && activeDropdown === item.name && (
                <div style={styles.dropdown}>
                  {item.subItems.map((subItem, sIdx) => (
                    <div
                      key={`${subItem}-${sIdx}`}
                      style={styles.submenuItem}
                      onClick={() => handleMenuClick(subItem)}
                    >
                      {subItem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.supportSection}>
          {supportItems.map((item, idx) => (
            <div key={`support-${idx}`} style={styles.supportItem}>
              {item.name}
            </div>
          ))}
        </div>
      </nav>

      <div style={{
    ...styles.content,
    marginLeft: isMenuVisible ? "25%" : "5%",  // Ajusta los valores según tu diseño
    transition: "margin-left 0.3s ease",
  }}>
        <div style={styles.buttonRow}>
          <div
            style={{
              marginTop: "5rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button style={styles.actionButton} onClick={fetchEntradas}>
              Update
            </button>
            <button
              style={styles.actionButton}
              onClick={() => setShowModal(true)}
            >
              Register Entry
            </button>
          </div>
          {showModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modal}>
                <h2>Register New Entry</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                   {/* input con búsqueda */}
                <input
                  name="id_alumno"
                  placeholder="Search Student ID or Name"
                  value={query}
                  onChange={handleInputChange}
                  style={styles.modalInput}
                  required
                />
                {filteredAlumnos.length > 0 && (
                  <ul style={styles.suggestionsList}>
                    {filteredAlumnos.map(a => (
                      <li
                        key={a.id_alumno}
                        style={styles.suggestionItem}
                        onClick={() => handleSelectAlumno(a)}
                      >
                        {a.id_alumno} - {a.nombre} {a.apellidos}
                      </li>
                    ))}
                  </ul>
                )}
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Name"
                    style={styles.modalInput}
                    value={formData.nombre}
                    readOnly
                  />
                  <input
                    type="text"
                    name="carrera"
                    placeholder="Degree ID"
                    style={styles.modalInput}
                    value={formData.carrera}
                    readOnly
                  />
                  <select
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleInputChange}
                    style={styles.modalInput}
                    required
                  >
                    <option value="">— Select Subject —</option>
                    <option value="Uso de equipo de computo">
                      Uso de equipo de computo
                    </option>
                    <option value="Estudio Libre">Estudio Libre</option>
                    <option value="Pedir Libro">Pedir Libro</option>
                  </select>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "1rem",
                    }}
                  >
                    <button type="submit" style={styles.actionButton}>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <h1>Entry Log</h1>
        {loadingEntradas ? (
          <p>Loading entries...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Student", "Name", "Major", "Date", "Subject"].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entradas.map((e, i) => (
                <tr key={i}>
                  <td style={styles.td}>{e.id_alumno}</td>
                  <td style={styles.td}>{e.nombre}</td>
                  <td style={styles.td}>
                    {carreras.find((c) => c.id_carrera === e.carrera)
                      ?.nombre_carrera || "Carrera no encontrada"}
                  </td>
                  <td style={styles.td}>
                    {new Date(e.fecha).toLocaleString("es-ES")}
                  </td>
                  <td style={styles.td}>{e.asunto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  app: { display: "flex", minHeight: "100vh", backgroundColor: "#f0f2f5" },
  header: {
    position: "fixed",
    width: "100%",
    background: "#1B396A",
    color: "white",
    padding: "1rem 2rem",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    zIndex: 100,
  },
  leftHeader: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    width: "100%",
  },
  button: {
    width: "55px",
    height: "55px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    flexShrink: 0,
    borderRadius: "50%",
    transition: "background-color 0.3s ease",
  },
  buttonUsr: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0",
    marginRight: "10px",
    flexShrink: 0,
    transition: "background-color 0.3s ease",
  },
  menuH: { width: "20px", height: "20px", filter: "brightness(0) invert(1)" },
  userimg: { width: "40px", height: "40px", filter: "brightness(0) invert(1)" },
  logo: { width: "auto", height: "70px", maxWidth: "200px", flexShrink: 0 },
  username: {
    fontSize: "1.4rem",
    fontWeight: "bold",
    opacity: 0.9,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "300px",
    flexShrink: 1,
    marginLeft: "63%",
  },
  sidebar: {
    width: 250,
    background: "#fff",
    color: "#333",
    padding: "5rem 1rem 1rem",
    position: "fixed",
    height: "100%",
    marginTop: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    zIndex: 99,
    top: 0,
    left: 0,
  },
  menuSection: { flex: 1 },
  menuItem: { marginBottom: "0.5rem" },
  menuMain: {
    padding: "0.8rem",
    cursor: "pointer",
    borderRadius: "4px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background 0.3s",
  },
  arrow: { fontSize: "0.8rem", transition: "transform 0.3s", color: "#666" },
  dropdown: {
    marginLeft: "1rem",
    borderLeft: "2px solid #e0e0e0",
    paddingLeft: "0.5rem",
  },
  submenuItem: {
    padding: "0.6rem",
    cursor: "pointer",
    borderRadius: "4px",
    transition: "background 0.3s",
    color: "#666",
  },
  supportSection: { borderTop: "1px solid #eee", paddingTop: "1rem" },
  supportItem: { padding: "0.8rem", color: "#666", cursor: "pointer" },
  content: {
    marginLeft: "20%",
    paddingTop: "150px",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },

  actionButton: {
    backgroundColor: "#1B396A",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "1rem 2rem",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginLeft: "3rem",
  },

  // Agrega este hover manualmente con inline style si quieres o usa CSS real:
  actionButtonHover: {
    backgroundColor: "#16305A",
  },

  table: {
    width: "140%", // puedes ajustar esto si quieres más ancho
    borderCollapse: "collapse",
    margin: "0 auto", // ← centra horizontalmente
    backgroundColor: "#fff",
    borderRadius: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  th: {
    textAlign: "center",
    padding: "2rem",
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#d9d9d9",
    fontWeight: "600",
    color: "#333",
  },

  td: {
    textAlign: "center",
    padding: "1rem",
    borderBottom: "1px solid #f0f0f0",
    color: "#555",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalInput: {
    width: "100%",
    height: "48px", // mayor altura
    padding: "0 12px", // más espaciado interno
    fontSize: "16px", // texto más legible
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box",
    marginBottom: "1rem",
  },
  modal: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    width: "400px",
    maxWidth: "90%",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },

  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

export default Entrance;
