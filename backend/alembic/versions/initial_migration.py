"""Initial migration

Revision ID: initial_migration
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'initial_migration'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create enum type for application status
    op.execute(""" DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'applicationstatus') THEN
            CREATE TYPE applicationstatus AS ENUM ('draft', 'applied', 'interview', 'offer', 'rejected', 'accepted');
        END IF;
    END
    $$;
    """)
    
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create resumes table
    op.create_table('resumes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_name', sa.String(), nullable=False),
        sa.Column('parsed_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_feedback', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resumes_id'), 'resumes', ['id'], unique=False)

    # Create cover_letters table
    op.create_table('cover_letters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('resume_id', sa.Integer(), nullable=True),
        sa.Column('job_description', sa.Text(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tone', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cover_letters_id'), 'cover_letters', ['id'], unique=False)

    # Create applications table
    op.create_table('applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('resume_id', sa.Integer(), nullable=True),
        sa.Column('cover_letter_id', sa.Integer(), nullable=True),
        sa.Column('company_name', sa.String(), nullable=False),
        sa.Column('position', sa.String(), nullable=False),
        sa.Column('job_url', sa.String(), nullable=True),
        sa.Column('application_deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', postgresql.ENUM(
            'draft', 'applied', 'interview', 'offer', 'rejected', 'accepted',
            name='applicationstatus',
            create_type=False  # ← prevents SQLAlchemy from trying to create it again
        ), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['cover_letter_id'], ['cover_letters.id'], ),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_applications_id'), 'applications', ['id'], unique=False)

def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_applications_id'), table_name='applications')
    op.drop_table('applications')
    
    op.drop_index(op.f('ix_cover_letters_id'), table_name='cover_letters')
    op.drop_table('cover_letters')
    
    op.drop_index(op.f('ix_resumes_id'), table_name='resumes')
    op.drop_table('resumes')
    
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Drop enum type
    op.execute("""
    DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'applicationstatus') THEN
            DROP TYPE applicationstatus;
        END IF;
    END
    $$;
    """)
