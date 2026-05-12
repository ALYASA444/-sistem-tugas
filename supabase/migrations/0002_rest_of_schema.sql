-- 0002_rest_of_schema.sql

-- Announcements Table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    priority TEXT CHECK (priority IN ('low', 'normal', 'high')) DEFAULT 'normal',
    image_url TEXT
);

-- Materials Table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    course TEXT NOT NULL,
    url TEXT NOT NULL,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type TEXT CHECK (type IN ('pdf', 'video', 'link')) DEFAULT 'link',
    image_url TEXT
);

-- Extending task table (just in case image_url wasn't there)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS image_url TEXT;

-- STORAGE BUCKET SCRIPT
-- Script ini untuk menciptakan bucket Storage "task_images" secara otomatis (Public)
INSERT INTO storage.buckets (id, name, public) VALUES ('task_images', 'task_images', true)
ON CONFLICT (id) DO NOTHING;

-- Mengizinkan publik untuk melihat gambar
CREATE POLICY "Public Read Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'task_images');

-- Mengizinkan service/komti untuk menyimpan file
CREATE POLICY "Komti Upload Access" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'task_images');

-- Update RLS Announcements & Materials (Similar to Tasks)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements viewable by everyone" ON announcements FOR SELECT USING (true);
CREATE POLICY "Materials viewable by everyone" ON materials FOR SELECT USING (true);

CREATE POLICY "Komti insert announcements" ON announcements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'komti')
);
CREATE POLICY "Komti update announcements" ON announcements FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'komti')
);
CREATE POLICY "Komti delete announcements" ON announcements FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'komti')
);

CREATE POLICY "Komti insert materials" ON materials FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'komti')
);
CREATE POLICY "Komti update materials" ON materials FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'komti')
);
CREATE POLICY "Komti delete materials" ON materials FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'komti')
);
