-- 0001_initial_schema.sql
-- Create users mapping table (profiles)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    nim TEXT UNIQUE,
    role TEXT CHECK (role IN ('komti', 'mahasiswa')) DEFAULT 'mahasiswa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    subject TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Example RLS Policy for Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Mahasiswa can only view tasks
CREATE POLICY "Tasks are viewable by everyone" ON tasks
    FOR SELECT USING (true);

-- Only komti can insert/update/delete tasks
CREATE POLICY "Komti can insert tasks" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'komti')
    );
