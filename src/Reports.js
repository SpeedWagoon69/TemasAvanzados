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
import jsPDF from "jspdf";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const supabase = createClient(
  "https://dqmbtidomzvhprovovyy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWJ0aWRvbXp2aHByb3Zvdnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgwOTUsImV4cCI6MjA1ODYwNDA5NX0.WU_NJH-XkC7Xi_uaWceZpMpZkZaujeX5L-L1RsbUDsg"
);

const Reports = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const navigate = useNavigate();
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [prestamos, setPrestamos] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prestamosCurso, setPrestamosCurso] = useState(0);
  const [prestamosMes, setPrestamosMes] = useState(0);
  const [prestamosAtrasados, setPrestamosAtrasados] = useState(0);

  // New state for reports
  const [reports, setReports] = useState([]);
  useEffect(() => {
    const loadReports = async () => {
      const { data, error } = await supabase
        .from('reportes')
        .select('nombre, fecha_creacion, datos')
        .order('fecha_creacion', { ascending: false });
      if (error) console.error('Error loading reports:', error);
      else setReports(data.map(r => ({
        name: r.nombre,
        date: new Date(r.fecha_creacion),
        data: r.datos
      })));
    };
    loadReports();
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const { data: prestamosData, error: prestamosError } = await supabase
        .from("prestamos")
        .select("*")
        .gte("fecha_prestamo", startOfMonth(currentDate).toISOString())
        .lte("fecha_prestamo", endOfMonth(currentDate).toISOString());

      if (prestamosError) throw prestamosError;
      setPrestamos(prestamosData);
      processChartData(prestamosData);

      const { data: cursoData } = await supabase.rpc(
        "get_total_prestamos_curso"
      );
      if (cursoData) setPrestamosCurso(cursoData);

      const { data: mesData } = await supabase.rpc("get_total_prestamos_mes", {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });
      if (mesData) setPrestamosMes(mesData);

      const { data: atrasadosData } = await supabase.rpc(
        "get_total_prestamos_atrasados"
      );
      if (atrasadosData) setPrestamosAtrasados(atrasadosData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const getCurrentLoans = () =>
    prestamos.filter((p) => !p.fecha_devolucion_real).length;

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
    if (window.confirm("¿Desea cerrar sesión?")) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };

  const handleMenuClick = (itemName) => {
    switch (itemName) {
      case "Books":
        navigate("/books");
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

  const toggleDropdown = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const sidebarStyles = {
    ...styles.sidebar,
    left: isMenuVisible ? 0 : -300,
    transition: "left 0.3s ease",
  };

  // Function to generate report
  const handleGenerateReport = async () => {
    try {
      // 1) Obtener datos del reporte
      const { data, error } = await supabase.rpc("get_report_data");
      if (error) throw error;
      const reportData = data[0];
      const reportName = `Reporte ${format(currentDate, "MMMM yyyy", {
        locale: es,
      })}`;

      // 2) Persistir en la base de datos
      const { error: insertError } = await supabase.rpc("insert_reporte", {
        _nombre: reportName,
        _datos: reportData,
        _id_analista: null, // Aquí podrías pasar el ID del analista desde el almacenamiento o contexto
      });
      if (insertError) throw insertError;

      // 3) Actualizar lista en UI
      setReports((prev) => [
        ...prev,
        { name: reportName, date: new Date(), data: reportData },
      ]);
    } catch (err) {
      alert(err.message);
    }
  };

  // Function to download as PDF
  const handleDownload = (report) => {
    const doc = new jsPDF();
    doc.text(report.name, 10, 10);
    doc.text(`Fecha: ${format(report.date, "Pp", { locale: es })}`, 10, 20);
    const d = report.data;
    doc.text(`Uso de equipo: ${d.uso_equipo_count}`, 10, 30);
    doc.text(`Préstamos libros: ${d.prestamos_libros_count}`, 10, 40);
    doc.text(`Alumnos mes: ${d.alumnos_mes_actual_count}`, 10, 50);
    doc.text(`Total libros: ${d.total_libros}`, 10, 60);
    doc.text(
      `% alumnos ingresados: ${d.porcentaje_alumnos_ingresados}%`,
      10,
      70
    );
    doc.save(`${report.name}.pdf`);
  };

  if (loading) return <div style={styles.container}>Cargando...</div>;

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
          {menuItems.map((item, index) => (
            <div key={`${item.name}-${index}`} style={styles.menuItem}>
              <div
                style={styles.menuMain}
                onClick={() => {
                  if (item.subItems) {
                    toggleDropdown(item.name);
                  } else {
                    handleMenuClick(item.name);
                  }
                }}
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
                  {item.subItems.map((subItem, subIndex) => (
                    <div
                      key={`${subItem}-${subIndex}`}
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
          {supportItems.map((item, index) => (
            <div key={`support-${index}`} style={styles.supportItem}>
              {item.name}
            </div>
          ))}
        </div>
      </nav>

      {/* Nuevo contenido agregado */}
      <div style={styles.content}>
        
        {/* Generate Report Button */}
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button onClick={handleGenerateReport} style={styles.actionButton}>
          Generate Report
          </button>
        </div>

        {/* Reports List */}
        <div style={styles.reportsList}>
          {reports.map((rep, idx) => (
            <div key={idx} style={styles.reportItem}>
              <span>
                {rep.name} -{" "}
                {format(rep.date, "dd/MM/yyyy HH:mm", { locale: es })}
              </span>
              <button
                onClick={() => handleDownload(rep)}
                style={styles.smallButton}
              >
                Download

              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Estilos originales + nuevos estilos
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
    justifyContent: "flex-start",
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
    marginLeft: "30%",
    paddingTop: "7%",
    minHeight: "110vh",
    backgroundColor: "#f0f2f5",
  },
  
  actionButton: {
    backgroundColor: "#1B396A",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.6rem 1.2rem",
    paddingTop: "1rem",
    cursor: "pointer",
    fontSize: "20px"
  },
  reportsList: { marginTop: "2rem", width: "100%", margin: "0 auto" },
  reportItem: {
    display: "flex",
    justifyContent: "flex-start",  // en lugar de space-between
    alignItems: "center",
    gap: "25rem",                   // espacio entre texto y botón
    padding: "1rem 5rem",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "0.5rem",
  },

  smallButton: {
    backgroundColor: "#1B396A",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "1rem 2rem",
    cursor: "pointer",
  },
};

export default Reports;
