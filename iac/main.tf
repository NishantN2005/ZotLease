provider "aws" {
  region = "us-east-1"
}

# S3 Bucket for Terraform state
resource "aws_s3_bucket" "terraform_state" {
  bucket = "zotlease-tf-state"
  acl    = "private"
}

# DynamoDB table for Terraform state locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

terraform {
  backend "s3" {
    bucket         = "zotlease-tf-state"
    key            = "terraform/state"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
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

# Secrets Manager Secret for PostgreSQL Admin User
resource "random_password" "db_admin_password" {
  length  = 16
  special = true
}

resource "aws_secretsmanager_secret" "db_admin_secret" {
  name = "zotlease-db-admin"
}

resource "aws_secretsmanager_secret_version" "db_admin_secret_version" {
  secret_id     = aws_secretsmanager_secret.db_admin_secret.id
  secret_string = jsonencode({
    username = "admin"
    password = random_password.db_admin_password.result
  })
}

# PostgreSQL Admin User Creation
resource "null_resource" "create_db_admin_user" {
  depends_on = [aws_db_instance.zotlease_db]

  provisioner "local-exec" {
    command = <<EOT
      PGPASSWORD=${var.db_password} psql -h ${aws_db_instance.zotlease_db.address} -U ${var.db_username} -d ${aws_db_instance.zotlease_db.name} -c "CREATE USER admin WITH PASSWORD '${random_password.db_admin_password.result}';"
      PGPASSWORD=${var.db_password} psql -h ${aws_db_instance.zotlease_db.address} -U ${var.db_username} -d ${aws_db_instance.zotlease_db.name} -c "GRANT ALL PRIVILEGES ON DATABASE ${aws_db_instance.zotlease_db.name} TO admin;"
    EOT
  }
}