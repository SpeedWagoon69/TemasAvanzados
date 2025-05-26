import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoTecNM from "./assets/Logo_TecNM_Horizontal_Blanco.png";
import menu from "./assets/menu.png";
import user from "./assets/ic_user.png";
import { createClient } from "@supabase/supabase-js";

// Inicializa Supabase
const supabase = createClient(
  "https://dqmbtidomzvhprovovyy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWJ0aWRvbXp2aHByb3Zvdnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgwOTUsImV4cCI6MjA1ODYwNDA5NX0.WU_NJH-XkC7Xi_uaWceZpMpZkZaujeX5L-L1RsbUDsg"
);
const countBusinessDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};
const Loans = () => {
  const navigate = useNavigate();
  // Control de autenticación: redirige a login si no hay token
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  // Control de autenticación: redirige a login si no hay token
  useEffect(() => {
    if (!token || !role) navigate("/login", { replace: true });
  }, [navigate, token, role]);

  // Sidebar state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);

  // Menú items
  const menuItems = [
    { name: "Dashboard", subItems: null },
    {
      name: "Library",
      subItems: [
        "Books",
        "Loans",
        ...(role === "admin" ? ["Generate Reports"] : []),
      ],
    },
    ...(role === "admin"
      ? [
          { name: "Personal", subItems: ["Students"] },
          { name: "Entry Register", subItems: null },
        ]
      : []),
    { name: "Settings", subItems: ["User"] },
    { name: "Log Out", subItems: null },
  ];
  const supportItems = [
    { name: "Soporte", subItems: null },
    { name: "Guía de uso", subItems: null },
  ];

  // Data loans
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analistas, setAnalistas] = useState([]);
  const [libros, setLibros] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  // Add/Edit modal states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    id_libro: "",
    id_analista: "",
    id_alumno: "",
    id_docente: "",
    fecha_prestamo: "",
    fecha_devolucion_prevista: "",
    fecha_devolucion_real: "",
    returnMode: "none",
  });
  const [editId, setEditId] = useState(null);

  // Initial load
  useEffect(() => {
    fetchLoans();
    fetchDropdownData();
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loans]);

  // Fetch loans via RPC
  const fetchLoans = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_loans");
    if (error) console.error("Error fetching loans:", error);
    else setLoans(data);
    setLoading(false);
  };

  const handleLogout = () => {
    if (window.confirm("Do you want to log out?")) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };

  // Handlers
  const toggleDropdown = (name) =>
    setActiveDropdown(activeDropdown === name ? null : name);
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);
  const handleMenuClick = (name) => {
    switch (name) {
      case "Dashboard":
        navigate("/dashboard");
        break;
      case "Books":
        navigate("/books");
        break;
      case "Generate Reports":
        navigate("/reports");
        break;
      case "Students":
        navigate("/students");
        break;
      case "Entry Register":
        navigate("/entrance");
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
  const validateDuration = () => {
    const { fecha_prestamo, fecha_devolucion_prevista } = formData;
    if (!fecha_prestamo || !fecha_devolucion_prevista) return false;
    const bd = countBusinessDays(
      new Date(fecha_prestamo),
      new Date(fecha_devolucion_prevista)
    );
    return bd === 8;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateDuration()) {
      alert("La duración debe ser exactamente 8 días hábiles.");
      return;
    }
    const { error } = await supabase.rpc("insert_prestamo", {
      _id_libro: parseInt(formData.id_libro),
      _id_analista: parseInt(formData.id_analista),
      _id_alumno: formData.id_alumno ? parseInt(formData.id_alumno) : null,
      _id_docente: formData.id_docente ? parseInt(formData.id_docente) : null,
      _fecha_prestamo: formData.fecha_prestamo,
      _fecha_devolucion_prevista: formData.fecha_devolucion_prevista,
    });
    if (error) alert(error.message);
    else {
      setShowAdd(false);
      fetchLoans();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateDuration()) {
      alert("La duración debe ser exactamente 8 días hábiles.");
      return;
    }
    const { error } = await supabase.rpc("update_prestamo_dates", {
      _id_prestamo: editId,
      _fecha_prestamo: formData.fecha_prestamo,
      _fecha_devolucion_prevista: formData.fecha_devolucion_prevista,
      _fecha_devolucion_real:
        formData.returnMode === "date" ? formData.fecha_devolucion_real : null,
    });
    if (error) alert(error.message);
    else {
      setShowEdit(false);
      fetchLoans();
    }
  };

  // Carga de analistas, libros y alumnos para selects
  const fetchDropdownData = async () => {
    const [{ data: ana }, { data: lib }, { data: alu }] = await Promise.all([
      supabase.from("analistas").select("id_analista, nombre, apellidos"),
      supabase.from("libros").select("id_libro, titulo"),
      supabase.from("alumnos").select("id_alumno, nombre, apellidos"),
    ]);
    setAnalistas(ana || []);
    setLibros(lib || []);
    setAlumnos(alu || []);
  };

  // Combine sidebar styles
  const sidebarStyles = {
    ...styles.sidebar,
    left: isMenuVisible ? 0 : -300,
    transition: "left 0.3s ease",
  };

  return (
    <div style={styles.app}>
      {/* Header */}
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
          <img src={logoTecNM} alt="Logo" style={styles.logo} />
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

      {/* Sidebar */}
      <nav style={sidebarStyles}>
        <div style={styles.menuSection}>
          {menuItems.map((item, i) => (
            <div key={i} style={styles.menuItem}>
              <div
                style={styles.menuMain}
                onClick={() =>
                  item.subItems
                    ? toggleDropdown(item.name)
                    : handleMenuClick(item.name)
                }
              >
                {item.name}{" "}
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
                  {item.subItems.map((s, j) => (
                    <div
                      key={j}
                      style={styles.submenuItem}
                      onClick={() => handleMenuClick(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={styles.supportSection}>
          {supportItems.map((s, i) => (
            <div key={i} style={styles.supportItem}>
              {s.name}
            </div>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div style={styles.content}>
        <h1>Book Loans</h1>
        <div style={styles.buttonRow}>
          <button onClick={() => setShowAdd(true)} style={styles.actionButton}>
            Add Loan
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                {[
                  "ID",
                  "Book",
                  "Borrower",
                  "Loan Date",
                  "Due Date",
                  "Actual Date",
                  "Actions",
                ].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr
                  key={l.id_prestamo}
                  style={styles.evenOdd[l.id_prestamo % 2]}
                >
                  <td style={styles.td}>{l.id_prestamo}</td>
                  <td style={styles.td}>{l.libro_titulo}</td>
                  <td style={styles.td}>{l.prestatario}</td>
                  <td style={styles.td}>{l.fecha_prestamo}</td>
                  <td style={styles.td}>{l.fecha_devolucion_prevista}</td>
                  <td style={styles.td}>
                    {l.fecha_devolucion_real || "Sin devolver"}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.smallButton}
                      onClick={() => {
                        setEditId(l.id_prestamo);
                        setFormData({
                          fecha_prestamo: l.fecha_prestamo,
                          fecha_devolucion_prevista:
                            l.fecha_devolucion_prevista,
                          fecha_devolucion_real: l.fecha_devolucion_real || "",
                          returnMode: l.fecha_devolucion_real ? "date" : "none",
                        });
                        setShowEdit(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Add Modal */}
        {showAdd && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>New Loan</h2>
              <form onSubmit={handleAdd} style={styles.form}>
                <select
                  name="id_libro"
                  value={formData.id_libro}
                  onChange={handleChange}
                  required
                  style={styles.modalInput}
                >
                  <option value="">— Select Book —</option>
                  {libros.map((b) => (
                    <option key={b.id_libro} value={b.id_libro}>
                      {b.id_libro} – {b.titulo}
                    </option>
                  ))}
                </select>

                <select
                  name="id_analista"
                  value={formData.id_analista}
                  onChange={handleChange}
                  required
                  style={styles.modalInput}
                >
                  <option value="">— Select Analyst —</option>
                  {analistas.map((a) => (
                    <option key={a.id_analista} value={a.id_analista}>
                      {a.id_analista} – {a.nombre} {a.apellidos}
                    </option>
                  ))}
                </select>

                <select
                  name="id_alumno"
                  value={formData.id_alumno}
                  onChange={handleChange}
                  style={styles.modalInput}
                >
                  <option value="">— Select Student —</option>
                  {alumnos.map((al) => (
                    <option key={al.id_alumno} value={al.id_alumno}>
                      {al.id_alumno} – {al.nombre} {al.apellidos}
                    </option>
                  ))}
                </select>

                <input
                  name="fecha_prestamo"
                  type="date"
                  onChange={handleChange}
                  required
                  style={styles.modalInput}
                />
                <input
                  name="fecha_devolucion_prevista"
                  type="date"
                  onChange={handleChange}
                  required
                  style={styles.modalInput}
                />

                <div style={styles.buttonRow}>
                  <button type="submit" style={styles.actionButton}>
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Edit Loan #{editId}</h2>
              <form onSubmit={handleEdit} style={styles.form}>
                <label style={styles.label}>
                  Loan Date:
                  <input
                    name="fecha_prestamo"
                    type="date"
                    value={formData.fecha_prestamo}
                    onChange={handleChange}
                    required
                    style={styles.modalInput}
                  />
                </label>
                <label style={styles.label}>
                  Due Date:
                  <input
                    name="fecha_devolucion_prevista"
                    type="date"
                    value={formData.fecha_devolucion_prevista}
                    onChange={handleChange}
                    required
                    style={styles.modalInput}
                  />
                </label>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <span>Actual Return:</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <select
                      name="returnMode"
                      value={formData.returnMode}
                      onChange={(e) => {
                        const mode = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          returnMode: mode,
                          fecha_devolucion_real:
                            mode === "date" ? prev.fecha_devolucion_real : "",
                        }));
                      }}
                      style={{ ...styles.modalInput, maxWidth: "200px" }}
                    >
                      <option value="none">Sin devolver</option>
                      <option value="date">Especificar fecha</option>
                    </select>
                    {formData.returnMode === "date" && (
                      <input
                        name="fecha_devolucion_real"
                        type="date"
                        value={formData.fecha_devolucion_real}
                        onChange={handleChange}
                        required
                        style={styles.modalInput}
                      />
                    )}
                  </div>
                </div>

                <div style={styles.buttonRow}>
                  <button type="submit" style={styles.actionButton}>
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
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
    </div>
  );
};

// Styles
const styles = {
  app: { display: "flex", minHeight: "100vh", backgroundColor: "#f0f2f5" },
  header: {
    position: "fixed",
    width: "100%",
    background: "#1B396A",
    color: "#fff",
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
    borderRadius: "50%",
    transition: "background-color 0.3s ease",
  },
  buttonUsr: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0",
    marginRight: "10px",
    transition: "background-color 0.3s ease",
  },
  menuH: { width: "20px", height: "20px", filter: "brightness(0) invert(1)" },
  userimg: { width: "40px", height: "40px", filter: "brightness(0) invert(1)" },
  logo: { width: "auto", height: "70px", maxWidth: "200px" },
  username: {
    fontSize: "1.4rem",
    fontWeight: "bold",
    opacity: 0.9,
    marginLeft: "auto",
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
  arrow: { fontSize: "0.8rem", color: "#666" },
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
    marginLeft: "25%",
    paddingTop: "7%",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    textAlign: "center",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    margin: "1rem 0",
  },
  actionButton: {
    backgroundColor: "#1B396A",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    margin: "0 auto",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  th: {
    padding: "1rem",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#d9d9d9",
    fontWeight: "600",
    textAlign: "center",
  },
  td: { padding: "1rem", borderBottom: "1px solid #eee", textAlign: "center" },
  headerRow: {},
  evenOdd: {
    0: { backgroundColor: "#f9f9f9" },
    1: { backgroundColor: "#ffffff" },
  },
  smallButton: {
    backgroundColor: "#1B396A",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    width: "500px",
    maxWidth: "90%",
  },
  modalTitle: {
    margin: "0 0 1.5rem",
    fontSize: "1.75rem",
    color: "#1B396A",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  modalInput: {
    width: "100%",
    height: "52px",
    padding: "0 1rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  actionButton: {
    backgroundColor: "#1B396A",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

export default Loans;
