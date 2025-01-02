provider "aws" {
  region = "us-east-1"
}

# RDS PostgreSQL Database
resource "aws_db_instance" "zotlease_db" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "13.3"
  instance_class       = "db.t3.micro"
  name                 = "zotlease"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres13"
  skip_final_snapshot  = true
}

# S3 Bucket
resource "aws_s3_bucket" "zotlease_bucket" {
  bucket = "zotlease-dev-photoupload"
  acl    = "private"
}

# ECR Repositories
resource "aws_ecr_repository" "api_repo" {
  name = "zotlease/api"
}

resource "aws_ecr_repository" "frontend_repo" {
  name = "zotlease/frontend"
}