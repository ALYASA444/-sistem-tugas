-- 0003_pdf_schema.sql

-- Extending tables to support PDF / Document attachments
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- We can reuse 'task_images' bucket for PDFs, but for clarity let's just make it universal
-- Actually, since bucket 'task_images' is already used by tasks images, we can either use it or create 'attachments'
-- Let's create 'attachments' bucket for PDFs specifically
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for attachments bucket
CREATE POLICY "Public Read Access Attachments" ON storage.objects 
FOR SELECT USING (bucket_id = 'attachments');

CREATE POLICY "Komti Upload Access Attachments" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'attachments');
