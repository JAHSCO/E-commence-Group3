import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://stnyaigzdkpnikizjcfw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bnlhaWd6ZGtwbmlraXpqY2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTA3MzksImV4cCI6MjA3NjEyNjczOX0.Q9gnu6AfukdMe_9B5ycRyGs7A8yBwrsc3radh5YA7iE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 
