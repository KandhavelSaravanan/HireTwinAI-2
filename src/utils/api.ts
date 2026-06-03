// Frontend API helper for communicating with the local Express/MySQL backend server.
// If the server is offline or fails, it falls back to localStorage so the app remains fully functional.

const API_BASE = "http://localhost:3001/make-server-c646ecc8";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

export async function fetchProfile(email: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("hiretwin_profile", JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Backend profile fetch failed, using local storage", e);
  }
  const local = localStorage.getItem("hiretwin_profile");
  return local ? JSON.parse(local) : null;
}

export async function saveProfile(email: string, profile: any): Promise<boolean> {
  localStorage.setItem("hiretwin_profile", JSON.stringify(profile));
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, profile }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (e) {
    console.warn("Backend profile save failed, saved locally", e);
  }
  return true;
}

export async function fetchResume(email: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/resume/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("hiretwin_resume", JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Backend resume fetch failed, using local storage", e);
  }
  const local = localStorage.getItem("hiretwin_resume");
  return local ? JSON.parse(local) : null;
}

export async function saveResume(email: string, resume: any): Promise<boolean> {
  localStorage.setItem("hiretwin_resume", JSON.stringify(resume));
  try {
    const res = await fetch(`${API_BASE}/resume`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, resume }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (e) {
    console.warn("Backend resume save failed, saved locally", e);
  }
  return true;
}

export async function fetchInterviews(email: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/interview/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("hiretwin_interviews", JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Backend interviews fetch failed, using local storage", e);
  }
  const local = localStorage.getItem("hiretwin_interviews");
  return local ? JSON.parse(local) : [];
}

export async function saveInterview(email: string, interview: any): Promise<boolean> {
  const local = localStorage.getItem("hiretwin_interviews");
  const list = local ? JSON.parse(local) : [];
  list.push(interview);
  localStorage.setItem("hiretwin_interviews", JSON.stringify(list));

  try {
    const res = await fetch(`${API_BASE}/interview`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, interview }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (e) {
    console.warn("Backend interview save failed, saved locally", e);
  }
  return true;
}

export async function fetchRoadmap(email: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/roadmap/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("hiretwin_roadmap", JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Backend roadmap fetch failed, using local storage", e);
  }
  const local = localStorage.getItem("hiretwin_roadmap");
  return local ? JSON.parse(local) : null;
}

export async function saveRoadmap(email: string, roadmap: any): Promise<boolean> {
  localStorage.setItem("hiretwin_roadmap", JSON.stringify(roadmap));
  try {
    const res = await fetch(`${API_BASE}/roadmap`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, roadmap }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (e) {
    console.warn("Backend roadmap save failed, saved locally", e);
  }
  return true;
}

export interface DashboardStats {
  careerScore: number;
  resumeStrength: number;
  learningStreak: number;
  totalInterviews: number;
  completedInterviews: number;
  roadmapProgress: number;
  skillsMastered: number;
}


export async function fetchDashboardStats(email: string): Promise<DashboardStats | null> {
  try {
    const res = await fetch(`${API_BASE}/dashboard-stats/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("hiretwin_dashboard_stats", JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Backend dashboard stats fetch failed, using local storage", e);
  }
  const local = localStorage.getItem("hiretwin_dashboard_stats");
  return local ? JSON.parse(local) : null;
}

export async function incrementLearningStreak(email: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/learning-streak/increment`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.streak !== undefined) {
        const localStats = localStorage.getItem("hiretwin_dashboard_stats");
        if (localStats) {
          try {
            const parsed = JSON.parse(localStats);
            parsed.learningStreak = data.streak;
            localStorage.setItem("hiretwin_dashboard_stats", JSON.stringify(parsed));
          } catch (e) {}
        }
        return data.streak;
      }
    }
  } catch (e) {
    console.warn("Backend streak increment failed", e);
  }
  return 0;
}

export async function fetchInterviewQuestions(type: string, email: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/interview-questions/${type}/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Backend fetchInterviewQuestions failed", e);
  }
  return [];
}

export async function fetchPortfolio(email: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/portfolio/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("hiretwin_portfolio", JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Backend portfolio fetch failed, using local storage", e);
  }
  const local = localStorage.getItem("hiretwin_portfolio");
  return local ? JSON.parse(local) : null;
}

export async function savePortfolio(email: string, portfolio: any): Promise<boolean> {
  localStorage.setItem("hiretwin_portfolio", JSON.stringify(portfolio));
  try {
    const res = await fetch(`${API_BASE}/portfolio`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, portfolio }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (e) {
    console.warn("Backend portfolio save failed, saved locally", e);
  }
  return true;
}

export async function fetchLinkedIn(email: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/linkedin/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("hiretwin_linkedin", JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (e) {
    console.warn("Backend linkedin fetch failed, using local storage", e);
  }
  const local = localStorage.getItem("hiretwin_linkedin");
  return local ? JSON.parse(local) : null;
}

export async function saveLinkedIn(email: string, linkedin: any): Promise<boolean> {
  localStorage.setItem("hiretwin_linkedin", JSON.stringify(linkedin));
  try {
    const res = await fetch(`${API_BASE}/linkedin`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, linkedin }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (e) {
    console.warn("Backend linkedin save failed, saved locally", e);
  }
  return true;
}



