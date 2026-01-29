# Replace the DATABASE_SCHEMA.md file with corrected version
@"
# 📊 DATABASE SCHEMA DESIGN
## Kenya National Intelligence Fusion Platform

### POSTGRESQL SCHEMA (Structured Intelligence Data)

``````sql
-- Core Intelligence Table
CREATE TABLE intelligence_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency VARCHAR(10) NOT NULL CHECK (agency IN ('NIS', 'DCI', 'KDF', 'ACA', 'KRA', 'KEBS', 'KPS', 'FRC')),
    classification VARCHAR(20) NOT NULL CHECK (classification IN ('UNCLASSIFIED', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET')),
    data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('HUMINT', 'SIGINT', 'OSINT', 'GEOINT', 'FININT', 'CYBINT')),
    threat_category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_encrypted TEXT NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    county VARCHAR(50),
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    source_reliability CHAR(1) CHECK (source_reliability IN ('A', 'B', 'C', 'D', 'E', 'F')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    correlation_tags TEXT[],
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Threat Correlations Table
CREATE TABLE threat_correlations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_intelligence_id UUID REFERENCES intelligence_reports(id),
    correlated_intelligence_ids UUID[],
    correlation_type VARCHAR(50) NOT NULL,
    correlation_score DECIMAL(3, 2) NOT NULL,
    threat_level VARCHAR(20) CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    predicted_impact DECIMAL(15, 2),
    recommended_actions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users and Access Control
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    agency VARCHAR(10) NOT NULL,
    clearance_level VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agencies Table
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mandate TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
