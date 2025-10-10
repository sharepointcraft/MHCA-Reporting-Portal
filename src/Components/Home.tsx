import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./Home.module.scss";
import { useNavigate } from "react-router-dom";

interface IHomeProps {
  context: any;
}

const Home: React.FC<IHomeProps> = ({ context }) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // 👈 new state
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const webUrl = context.pageContext.web.absoluteUrl;
      const response = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('Departments')/items?$select=Title,Color,Icons,Description`,
        {
          headers: {
            Accept: "application/json;odata=nometadata",
          },
        }
      );
      const data = await response.json();
      setDepartments(data.value);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // 🔍 Filter departments by search term
  const filteredDepartments = departments.filter((dept) =>
    dept.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Search Box */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // 👈 update state
        />
        <button>🔍</button>
      </div>

      {/* Departments Grid */}
      <div className={styles.departmentsGrid}>
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((dept, index) => (
            <div
              key={index}
              className={styles.departmentCard}
              onClick={() => navigate(`/${encodeURIComponent(dept.Title)}`)}
              style={{ backgroundColor: dept.Color || "#2196F3" }}
            >
              <div className={styles.iconArea}>
                <span>{dept.Icons || "🏢"}</span>
              </div>
              <h3>{dept.Title}</h3>
            </div>
          ))
        ) : (
          <p>No departments found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
