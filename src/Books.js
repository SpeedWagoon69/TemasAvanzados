import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoTecNM from "./assets/Logo_TecNM_Horizontal_Blanco.png";
import menu from "./assets/menu.png";
import user from "./assets/ic_user.png";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://dqmbtidomzvhprovovyy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWJ0aWRvbXp2aHByb3Zvdnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjgwOTUsImV4cCI6MjA1ODYwNDA5NX0.WU_NJH-XkC7Xi_uaWceZpMpZkZaujeX5L-L1RsbUDsg"
);

const Books = () => {
  const navigate = useNavigate();

  // Sidebar/menu state
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isUserHovered, setIsUserHovered] = useState(false);

  // Data & pagination state
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 100;
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filteredBook, setFilteredBook] = useState(null);

  const token = localStorage.getItem("token");
  //linea del rol afecta al useEffect
  const role = localStorage.getItem("userRole");
  useEffect(() => {
    if (!token || !role) navigate("/login", { replace: true });
  }, [navigate, token, role]);
  //cambios del menuItems
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

  // Fetch a page of books
  const fetchBooks = async (page = 1) => {
    const from = (page - 1) * booksPerPage;
    const to = from + booksPerPage - 1;
    const { data, error } = await supabase
      .from("libros")
      .select("*")
      .range(from, to);
    if (error) {
      console.error("Error fetching books:", error);
    } else {
      setBooks(data);
      setCurrentPage(page);
      setFilteredBook(null);
      setSearchTerm("");
    }
  };

  // Navigate to a different page
  const goToPage = (p) => {
    if (p < 1) return;
    fetchBooks(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check auth & initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    } else {
      fetchBooks(1);
    }
  }, [navigate]);

  // Suggestion lookup
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      const { data } = await supabase
        .from("libros")
        .select("id_libro, titulo")
        .ilike("titulo", `%${searchTerm}%`)
        .limit(5);
      setSuggestions(data || []);
    };
    fetchSuggestions();
  }, [searchTerm]);

  // Handlers
  const handleSelectSuggestion = async (sugg) => {
    const { data, error } = await supabase
      .from("libros")
      .select("*")
      .eq("id_libro", sugg.id_libro)
      .single();
    if (error) console.error(error);
    else {
      setFilteredBook(data);
      setSuggestions([]);
      setSearchTerm(data.titulo);
    }
  };
  const handleClear = () => {
    fetchBooks(1);
  };
  const toggleDropdown = (name) =>
    setActiveDropdown(activeDropdown === name ? null : name);
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);
  const handleLogout = () => {
    if (window.confirm("¿Desea cerrar sesión?")) {
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };
  const handleMenuClick = (name) => {
    switch (name) {
      case "Dashboard":
        return navigate("/dashboard");
      case "Loans":
        return navigate("/loans");
      case "Generate Reports":
        return navigate("/reports");
      case "Students":
        return navigate("/students");
      case "Entry Register":
        return navigate("/entrance");
        case "User":
          navigate("/user");
          break;
      case "Log Out":
        return handleLogout();
      default:
        return;
    }
  };

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
                  {item.subItems.map((sub, idx) => (
                    <div
                      key={idx}
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

      {/* Content */}
      <div
        style={{
          ...styles.content,
          marginLeft: isMenuVisible ? "25%" : "5%", // Ajusta los valores según diseño
          transition: "margin-left 0.3s ease",
        }}
      >
        <h2>Books List</h2>
        <div
          style={{
            marginBottom: "2rem",
            position: "relative",
            display: "flex",
            gap: "0.5rem",
            height: "1%",
          }}
        >
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...styles.modalInput, flex: 1 }}
          />
          <button onClick={handleClear} style={styles.cancelButton}>
            Clear
          </button>
          {suggestions.length > 0 && (
            <ul style={styles.suggestionList}>
              {suggestions.map((s) => (
                <li
                  key={s.id_libro}
                  onClick={() => handleSelectSuggestion(s)}
                  style={styles.suggestionItem}
                >
                  {s.titulo}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={styles.tableWrapper}>
          <h2 style={styles.tableTitle}>Books List</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                {["ID", "Unit", "Title", "Author", "Classification"].map(
                  (h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {(filteredBook ? [filteredBook] : books).map((b, i) => (
                <tr
                  key={b.id_libro}
                  style={i % 2 === 0 ? styles.evenRow : styles.oddRow}
                >
                  <td style={styles.td}>{b.id_libro}</td>
                  <td style={styles.td}>{b.unidad}</td>
                  <td style={styles.td}>{b.titulo}</td>
                  <td style={styles.td}>{b.autor}</td>
                  <td style={styles.td}>{b.clasificacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredBook && (
            <div style={styles.pagination}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={
                  currentPage === 1
                    ? styles.pageButtonDisabled
                    : styles.pageButton
                }
              >
                Back
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                style={styles.pageButton}
              >
                Next
              </button>
            </div>
          )}
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
    borderRadius: "50%",
    transition: "background-color 0.3s ease",
  },
  buttonUsr: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
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
    marginLeft: "18%",
    paddingTop: "8%",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
  },
  modalInput: {
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    marginBottom: "0.5rem",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
  },
  suggestionList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ccc",
    listStyle: "none",
    margin: 0,
    padding: 0,
    maxHeight: "150px",
    overflowY: "auto",
    zIndex: 100,
  },
  suggestionItem: { padding: "8px", cursor: "pointer" },

  tableWrapper: {
    marginTop: "1.5rem",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  tableTitle: {
    margin: 0,
    padding: "1rem",
    backgroundColor: "#1B396A",
    color: "#fff",
    fontSize: "1.25rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {},
  th: {
    padding: "1rem",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#d9d9d9",
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  td: {
    padding: "1rem",
    borderBottom: "1px solid #eee",
    textAlign: "center",
    color: "#555",
  },
  evenRow: { backgroundColor: "#f9f9f9" },
  oddRow: { backgroundColor: "#ffffff" },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
  },
  pageButton: {
    backgroundColor: "#1B396A",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  pageButtonDisabled: {
    backgroundColor: "#ccc",
    color: "#666",
    cursor: "not-allowed",
    borderRadius: "6px",
    padding: "0.6rem 1.2rem",
  },
};

export default Books;
