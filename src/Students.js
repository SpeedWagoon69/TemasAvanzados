import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoTecNM from "./assets/Logo_TecNM_Horizontal_Blanco.png";
import menu from "./assets/menu.png";
import user from "./assets/ic_user.png";
import { createClient } from "@supabase/supabase-js";

// Inicializa cliente Supabase
const supabase = createClient(
  "https://dqmbtidomzvhprovovyy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWJ0aWRvbXp2aHByb3Zvdnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgwOTUsImV4cCI6MjA1ODYwNDA5NX0.WU_NJH-XkC7Xi_uaWceZpMpZkZaujeX5L-L1RsbUDsg"
);

const Students = () => {
  const navigate = useNavigate();

  // Estados para menú
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);

  // Elementos de menú
  const menuItems = [
    { name: "Dashboard", subItems: null },
    {
      name: "Library",
      subItems: ["Books", "Generate Reports", "Loans", "Arrears"],
    },
    { name: "Personal", subItems: ["Teachers", "Students"] },
    { name: "Entry Register", subItems: null },
    { name: "Settings", subItems: ["Dark Mode", "User"] },
    { name: "Log Out", subItems: null },
  ];
  const supportItems = [
    { name: "Soporte", subItems: null },
    { name: "Guía de uso", subItems: null },
  ];

  // Estado para lista de alumnos
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para modal de agregar alumno (ahora incluye id_alumno)
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id_alumno: "",
    nombre: "",
    apellidos: "",
    id_carrera: "",
    estatus: "activo",
    password: "",
  });

  // Redirección si no hay token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  // Carga inicial de alumnos
  const fetchAlumnos = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("obetener_alumnos");
    if (error) console.error("Error al cargar alumnos:", error);
    else setAlumnos(data);
    setLoading(false);
  };
  useEffect(() => {
    fetchAlumnos();
  }, []);

  // Inserta nuevo alumno con ID proporcionado
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const { id_alumno, nombre, apellidos, id_carrera, estatus, password } =
      newStudent;
    const { error } = await supabase.rpc("insertar_alumno", {
      _id_alumno: parseInt(id_alumno, 10),
      _nombre: nombre,
      _apellidos: apellidos,
      _id_carrera: parseInt(id_carrera, 10),
      _estatus: estatus,
      _password: password,
    });
    if (error) {
      console.error("Error inserting student:", error);
      alert(`Error: ${error.message}`);
    } else {
      alert("Student added successfully.");
      setShowModal(false);
      setNewStudent({
        id_alumno: "",
        nombre: "",
        apellidos: "",
        id_carrera: "",
        estatus: "activo",
        password: "",
      });
      fetchAlumnos();
    }
  };

  // Handlers de menú
  const toggleDropdown = (name) =>
    setActiveDropdown(activeDropdown === name ? null : name);
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);
  const handleLogout = () => {
    if (window.confirm("Do you want to log out?")) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };
  const handleMenuClick = (item) => {
    switch (item) {
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
      case "Entry Register":
        navigate("/entrance");
        break;
      case "Log Out":
        handleLogout();
        break;
      default:
        break;
    }
    
  };
  const sidebarStyles = {
    ...styles.sidebar,
    left: isMenuVisible ? 0 : -300,
    transition: "left 0.3s ease",
  };

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.leftHeader}>
          <button
            style={{
              ...styles.button,
              backgroundColor: isMenuHovered
                ? "rgba(255,255,255,0.1)"
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
                ? "rgba(255,255,255,0.1)"
                : "transparent",
            }}
            onMouseEnter={() => setIsUserHovered(true)}
            onMouseLeave={() => setIsUserHovered(false)}
          >
            <img src={user} alt="user" style={styles.userimg} />
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <nav style={sidebarStyles}>
        <div style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <div key={idx} style={styles.menuItem}>
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
                  {item.subItems.map((sub, i) => (
                    <div
                      key={i}
                      style={styles.submenuItem}
                      onClick={() => handleMenuClick(sub)}
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
      </nav>

      {/* CONTENIDO */}
      <div style={styles.content}>
        {/* Botones */}
        
        <div style={{
            marginTop: "5rem",
            display: "flex",
            justifyContent: "center",
          }}>
          <button style={styles.actionButton} onClick={fetchAlumnos}>
            Update
          </button>
          <button
            style={styles.actionButton}
            onClick={() => setShowModal(true)}
          >
            Add Student
          </button>
        </div>

        {/* Tabla */}
        <div style={styles.tableWrapper}>
          <h2 style={styles.tableTitle}>Student List</h2>
          {loading ? (
            <p>Loading students...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  {["Enrollment", "Full Name", "Career", "Status"].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alumnos.map((a, i) => (
                  <tr
                    key={a.id_alumno}
                    style={i % 2 === 0 ? styles.evenRow : styles.oddRow}
                  >
                    <td style={styles.td}>{a.id_alumno}</td>
                    <td style={styles.td}>{a.nombre_completo}</td>
                    <td style={styles.td}>{a.carrera}</td>
                    <td style={styles.td}>{a.estatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={{ marginBottom: "1rem" }}>Add New Student</h2>
              <form onSubmit={handleAddStudent} style={styles.form}>
                <input
                  type="number"
                  placeholder="Student ID"
                  value={newStudent.id_alumno}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, id_alumno: e.target.value })
                  }
                  style={styles.modalInput}
                  required
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={newStudent.nombre}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, nombre: e.target.value })
                  }
                  style={styles.modalInput}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newStudent.apellidos}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, apellidos: e.target.value })
                  }
                  style={styles.modalInput}
                  required
                />
                <input
                  type="number"
                  placeholder="Career ID"
                  value={newStudent.id_carrera}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, id_carrera: e.target.value })
                  }
                  style={styles.modalInput}
                  required
                />
                <select
                  value={newStudent.estatus}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, estatus: e.target.value })
                  }
                  style={styles.modalInput}
                >
                  {["activo", "inactivo", "egresado", "baja"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <input
                  type="password"
                  placeholder="Password"
                  value={newStudent.password}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, password: e.target.value })
                  }
                  style={styles.modalInput}
                  required
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.actionButton}>
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
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
  leftHeader: { display: "flex", alignItems: "center", gap: "30px" },
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
    marginLeft: "22%",
    paddingTop: "8%",
    minHeight: "110vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    textAlign: "center",
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
    paddingTop: "1rem",
    marginLeft: "1rem",
    transition: "background-color 0.3s ease",
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
  tableWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "200%",
    margin: "0 auto",
  },
  tableTitle: { margin: "0 0 1rem" },
  table: {
    width: "110%",
    margin: "0 auto",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  th: {
    padding: "2rem",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#d9d9d9",
    color: "#333",
    fontWeight: "800",
    textAlign: "center",
  },
  td: {
    padding: "2rem",
    borderBottom: "1px solid #eee",
    color: "#555",
    textAlign: "center",
  },
  headerRow: {},
  evenRow: { backgroundColor: "#f9f9f9" },
  oddRow: { backgroundColor: "#ffffff" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    width: "400px",
    maxWidth: "90%",
  },
  form: { display: "flex", flexDirection: "column", gap: "0.8rem" },
  modalInput: {
    width: "100%",
    height: "48px",
    padding: "0 12px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box",
    marginBottom: "1rem",
  },
};

export default Students;
