import  {useState, createContext, useContext, useEffect} from 'react';


const AuthContext = createContext();

export default function AuthProvider({children}) {

    const [user, setUser] = useState(null);
    const [ loading, setLoading] = useState(false);
    const [ error, setError] = useState(null);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
      
        try {
          const response = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
      
          const data = await response.json();
          if (response.ok) {
            setUser({
              username: data.username,
              firstName: data.first_name,
              lastName: data.last_name,
            });
            localStorage.setItem('isAuthenticated', 'true');
            return true; // Indicate successful login
          } else {
            setError(data.error || "Invalid Credentials");
            return false; // Indicate failed login
          }
        } catch (error) {
          setError('Network error');
          return false; // Indicate failed login
        } finally {
          setLoading(false);
        }
      };


    const logout = () => {
        setLoading(false);
        setUser(null); // Clear user
        
        localStorage.removeItem('isAuthenticated'); // Clear authentication status from localStorage
    };

  return (
    <AuthContext.Provider value={{user, error, loading, login, logout}}>
        {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
