import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import logoTecNM from "./assets/Logo_TecNM_Horizontal_Blanco.png";
import menu from "./assets/menu.png";
import user from "./assets/ic_user.png";
import { createClient } from "@supabase/supabase-js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const supabase = createClient(
  "https://dqmbtidomzvhprovovyy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWJ0aWRvbXp2aHByb3Zvdnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgwOTUsImV4cCI6MjA1ODYwNDA5NX0.WU_NJH-XkC7Xi_uaWceZpMpZkZaujeX5L-L1RsbUDsg"
);

const Dashboard = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const navigate = useNavigate();
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);
  const [currentDate] = useState(new Date());
  const [prestamos, setPrestamos] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prestamosEnCurso, setPrestamosEnCurso] = useState(0);
  const [prestamosAtrasados, setPrestamosAtrasados] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch loans in current month for chart
      const { data: prestamosData, error: prestamosError } = await supabase
        .from("prestamos")
        .select("*")
        .gte("fecha_prestamo", startOfMonth(currentDate).toISOString())
        .lte("fecha_prestamo", endOfMonth(currentDate).toISOString());
      if (prestamosError) throw prestamosError;
      setPrestamos(prestamosData);
      processChartData(prestamosData);

      // Fetch count of ongoing loans
      const { data: cursoCount, error: cursoError } = await supabase.rpc(
        "get_prestamos_actuales"
      );
      if (cursoError) throw cursoError;
      setPrestamosEnCurso(cursoCount);

      // Fetch count of overdue loans
      const { data: atrasadosCount, error: atrasadosError } =
        await supabase.rpc("get_prestamos_atrasados");
      if (atrasadosError) throw atrasadosError;
      setPrestamosAtrasados(atrasadosCount);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data) => {
    const dailyCounts = data.reduce((acc, { fecha_prestamo }) => {
      const date = format(parseISO(fecha_prestamo), "dd/MM");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    setChartData({
      labels: Object.keys(dailyCounts),
      datasets: [
        {
          label: "Préstamos por día",
          data: Object.values(dailyCounts),
          backgroundColor: "#1B396A",
          borderColor: "#1B396A",
          borderWidth: 1,
        },
      ],
    });
  };

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

  const handleLogout = () => {
    if (window.confirm("Do you want to log out?")) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };

  const handleMenuClick = (itemName) => {
    switch (itemName) {
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

  const toggleDropdown = (itemName) =>
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

  if (loading) return <div style={styles.container}>Loading...</div>;
  const sidebarStyles = {
    ...styles.sidebar,
    left: isMenuVisible ? 0 : -300,
    transition: "left 0.3s ease",
  };
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
        <div style={styles.supportSection}>
          {supportItems.map((it, i) => (
            <div key={i} style={styles.supportItem}>
              {it.name}
            </div>
          ))}
        </div>
      </nav>
      <div style={styles.content}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div style={{ ...styles.chartContainer, flex: 2 }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: {
                    display: true,
                    text: `Loans - ${format(currentDate, "MMMM yyyy", {
                      locale: es,
                    })}`,
                  },
                },
              }}
            />
          </div>
          <div style={{ ...styles.statsContainer, flex: 1 }}>
            <div style={styles.statCard}>
              <h3>Ongoing Loans</h3>
              <h1 style={{ color: "#1B396A", fontSize: "2.5rem" }}>
                {prestamosEnCurso}
              </h1>
            </div>
            <div style={styles.statCard}>
              <h3>Overdue Loans</h3>
              <h1 style={{ color: "#1B396A", fontSize: "2.5rem" }}>
                {prestamosAtrasados}
              </h1>
            </div>
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
    marginLeft: "600px",
    paddingTop: "7%",
    backgroundColor: "#f0f2f5",
  },
  statsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    paddingLeft: 0,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#fff",
    width:"600px",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    height: "400px",
    marginBottom: "2rem",
  },
};

export default Dashboard;
