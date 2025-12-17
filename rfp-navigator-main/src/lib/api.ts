const API_BASE = "http://localhost:8000"; // Assuming local backend

export const api = {
    scan: async (demo: boolean = true, urls: string[] = []) => {
        const res = await fetch(`${API_BASE}/api/v1/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ demo, urls }),
        });
        return res.json();
    },

    trigger: async (rfp_url?: string) => {
        const res = await fetch(`${API_BASE}/api/v1/trigger`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rfp_url }),
        });
        return res.json();
    },

    getPipelineStatus: async (pipelineId: string) => {
        const res = await fetch(`${API_BASE}/api/v1/pipeline/${pipelineId}`);
        return res.json();
    },

    getPipelineFinal: async (pipelineId: string) => {
        const res = await fetch(`${API_BASE}/api/v1/pipeline/${pipelineId}/final`);
        return res.json();
    }
};
