import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import RequireAuth from "./components/Auth/RequireAuth";

import Tasks from "./pages/Tasks/Tasks";
import Notes from "./pages/Notes/Notes";
import Assistant from "./pages/Assistant/Assistant";
import Music from "./pages/Music/Music";
import Settings from "./pages/Settings/Settings";
import Today from "./pages/Tasks/Today";
import ThisWeek from "./pages/Tasks/ThisWeek";
import HighPriority from "./pages/Tasks/HighPriority";
import Completed from "./pages/Tasks/Completed";
import NewNote from "./pages/Notes/NewNote";
import StudyPlaylists from "./pages/Music/StudyPlaylists";
import Calendar from "./pages/Calendar/Calendar";

import Auth from "./pages/LoginRegister/Auth";
import VerifyAccount from "./pages/VerifyAccount/VerifyAccount";
import VerifySuccess from "./pages/VerifySuccess/VerifySuccess";

import { LoadingProvider } from "./context/LoadingContext";

function App() {
  return (
    <LoadingProvider>
      <Router>
              <Routes>

                  {/* Public routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/verify" element={<VerifyAccount />} />
                  <Route path="/verify-success" element={<VerifySuccess />} />

                  {/* Protected routes */}
                  <Route
                      path="/"
                      element={
                          <RequireAuth>
                              <Layout />
                          </RequireAuth>
                      }
                  >
                      <Route path="home" element={<h1>Welcome to Bucket Lyst</h1>} />

                      <Route path="tasks" element={<Tasks />} />
                      <Route path="tasks/today" element={<Today />} />
                      <Route path="tasks/week" element={<ThisWeek />} />
                      <Route path="tasks/high" element={<HighPriority />} />
                      <Route path="tasks/completed" element={<Completed />} />

                      <Route path="notes" element={<Notes />} />
                      <Route path="notes/new" element={<NewNote />} />

                      <Route path="assistant" element={<Assistant />} />

                      <Route path="music" element={<Music />} />
                      <Route path="music/study" element={<StudyPlaylists />} />

                      <Route path="calendar" element={<Calendar />} />

                      <Route path="settings" element={<Settings />} />
                  </Route>

              </Routes>

      </Router>
    </LoadingProvider>
  );
}

export default App;
