-- Migrasi untuk menampung riwayat penyelesaian tugas per akun

CREATE TABLE IF NOT EXISTS task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- Kebijakan Keamanan (opsional jika dipakai via anon)
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Semua orang bisa melihat status" ON task_completions 
FOR SELECT USING (true);

-- Backend (Sistem Admin) menangani insersi
