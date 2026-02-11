
import Button from "../../assets/componets/Button/Button"
import client from '../../lib/directus';
import { useNavigate } from 'react-router-dom';


function Dashboard(){

  const navigate = useNavigate();

    const handleLogout = async () => {
      try {
          // This tells the Directus API to invalidate the Refresh Token
          await client.logout();
      } catch (error) {
          console.error("Logout error (likely already expired):", error);
      } finally {
          // Always redirect the user even if the server-side logout fails
          navigate('/');
      }
  };

  return(
    <div>
      <h1>This is Dashboard page</h1>
      <Button type="danger" onClick={handleLogout}>Logout</Button>
    </div>
  )
}

export default Dashboard