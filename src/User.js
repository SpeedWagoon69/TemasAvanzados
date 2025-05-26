import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import logoTecNM from "./assets/Logo_TecNM_Horizontal_Blanco.png";
import menu from "./assets/menu.png";
import user from "./assets/ic_user.png";

// Supabase
const supabase = createClient(
  "https://dqmbtidomzvhprovovyy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWJ0aWRvbXp2aHByb3Zvdnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgwOTUsImV4cCI6MjA1ODYwNDA5NX0.WU_NJH-XkC7Xi_uaWceZpMpZkZaujeX5L-L1RsbUDsg"
);

const User = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // suponga que guardan ID de analista

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);

  // Profile data
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token || !userId) navigate("/login");
    fetchProfile();
  }, [navigate, token, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("analistas")
      .select("id_analista, nombre, apellidos, usuario")
      .eq("id_analista", userId)
      .single();
    if (error) console.error(error);
    else setProfile(data);
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    // Llamar backend RPC para actualizar contraseña
    const { error } = await supabase.rpc("update_analista_password", {
      _id_analista: userId,
      _old_password: oldPassword,
      _new_password: newPassword,
    });
    if (error) alert(error.message);
    else {
      alert("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const menuItems = [
    { name: "Dashboard", subItems: null },
    {
      name: "Library",
      subItems: ["Books", "Generate Reports", "Loans"],
    },
    { name: "Personal", subItems: ["Students"] },
    { name: "Entry Register", subItems: null },
    { name: "Settings", subItems: ["User"] },
    { name: "Log Out", subItems: null },
  ];

  const handleLogout = () => {
    if (window.confirm("Do you want to log out?")) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };

  const toggleDropdown = (name) =>
    setActiveDropdown(activeDropdown === name ? null : name);
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);
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

      case "Log Out":
        handleLogout();
        break;
      default:
        break;
    }
  };
  const supportItems = [
    { name: "Soporte", subItems: null },
    { name: "Guía de uso", subItems: null },
  ];
  const sidebarStyles = {
    ...styles.sidebar,
    left: isMenuVisible ? 0 : -300,
    transition: "left 0.3s ease",
  };
  if (loading || !profile) return <div>Cargando perfil...</div>;

  return (
    <div style={styles.app}>
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

      <div
        style={{
          ...styles.content,
          marginLeft: isMenuVisible ? "25%" : "5%", // Ajusta los valores según diseño
          transition: "margin-left 0.3s ease",
          display: "flex",
flexDirection: "column",
alignItems: "center",
        }}
      >
        <div style={{...styles.statsContainer, flex: 1}}>
        <h1>Perfil de Analista</h1>
        <div style={styles.profileCard}>
          <p>
            <strong>ID:</strong> {profile.id_analista}
          </p>
          <p>
            <strong>Nombre:</strong> {profile.nombre} {profile.apellidos}
          </p>
          <p>
            <strong>Usuario:</strong> {profile.usuario}
          </p>
        </div>

        <div style={styles.card}>
          <h2>Cambiar Contraseña</h2>
          <form onSubmit={handlePasswordUpdate} style={styles.form}>
            <input
              type="password"
              placeholder="Contraseña actual"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.saveButton}>
              Actualizar
            </button>
          </form>
        </div>
        </div>
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
  profileCard: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto 2rem",
    boxSizing: "border-box",
  },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  form: { display: "flex", flexDirection: "column", gap: "2rem" , width:"60rem"},
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  saveButton: {
    padding: "0.75rem",
    background: "#1B396A",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  chartContainer: {
    backgroundColor: "#fff",
    width:"600px",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    height: "100rem",
    marginBottom: "2rem",
  },
};

export default User;
