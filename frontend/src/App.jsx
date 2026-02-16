import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages & Dashboards
import Register from './pages/Register';
import Login from './pages/Login';

// Student Components
import StudentDashboard from './dashboards/Student/StudentDashboard';
import Syllabus from './dashboards/Student/Syllabus';
import Materials from './dashboards/Student/Materials';
import Videos from './dashboards/Student/Videos'; // Student View: Read-only
import AITutor from './dashboards/Student/AITutor';

// Expert Components
import ExpertDashboard from './dashboards/Expert/ExpertDashboard';
import UploadSyllabus from './dashboards/Expert/UploadSyllabus';  
import UploadMaterials from './dashboards/Expert/UploadMaterials'; 
import UploadVideos from './dashboards/Expert/UploadVideos'; // Expert View: Management
import ManageStudents from './dashboards/Expert/ManageStudents';   

// Layouts & Components
import Sidebar from './components/Sidebar';
import ExpertLayout from './Layouts/ExpertLayout'; 

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'expert' ? '/expert' : '/student'} />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Expert Section */}
          <Route 
            path="/expert" 
            element={
              <ProtectedRoute allowedRole="expert">
                <ExpertLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ExpertDashboard />} />
            <Route path="syllabus" element={<UploadSyllabus />} />
            <Route path="materials" element={<UploadMaterials />} />
            <Route path="videos" element={<UploadVideos />} />
            <Route path="students" element={<ManageStudents />} />
          </Route>

          {/* Student Section */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRole="student">
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
                    <Routes>
                      <Route path="/" element={<StudentDashboard />} />
                      <Route path="syllabus" element={<Syllabus />} />
                      <Route path="materials" element={<Materials />} />
                      <Route path="videos" element={<Videos />} />
                      <Route path="ai-tutor" element={<AITutor />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;