-- Hong Kong Home Affairs AI Assistant - Supabase Database Schema
-- Copy and run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on created_at for analytics
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- User sessions table (optional - for session management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Create index on user_id for faster session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);

-- Create index on session_token for authentication
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);

-- Conversation history table (optional - for storing chat history)
CREATE TABLE IF NOT EXISTS conversation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    message_role VARCHAR(20) NOT NULL CHECK (message_role IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Create index on user_id for fetching user conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversation_history(user_id);

-- Create index on session_id for fetching session conversations
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversation_history(session_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can view their own conversation history
CREATE POLICY "Users can view own conversations" ON conversation_history
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own conversation history
CREATE POLICY "Users can insert own conversations" ON conversation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sample data (optional - for testing)
-- INSERT INTO users (email, password_hash, full_name) VALUES
-- ('test@example.com', '$2a$10$SAMPLE_HASH', 'Test User');

-- Grant permissions (adjust based on your Supabase setup)
-- GRANT ALL ON users TO authenticated;
-- GRANT ALL ON user_sessions TO authenticated;
-- GRANT ALL ON conversation_history TO authenticated;

-- View to get user statistics (optional)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.created_at,
    u.last_login,
    COUNT(DISTINCT ch.session_id) as total_sessions,
    COUNT(ch.id) as total_messages
FROM users u
LEFT JOIN conversation_history ch ON u.id = ch.user_id
GROUP BY u.id, u.email, u.full_name, u.created_at, u.last_login;

-- Comments
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE user_sessions IS 'Stores active user sessions for authentication';
COMMENT ON TABLE conversation_history IS 'Stores chat conversation history';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.is_active IS 'Flag to enable/disable user accounts';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Hong Kong Home Affairs AI Assistant database schema created successfully!';
END $$;

