from pydantic import BaseSettings

class Settings(BaseSettings):
    SQLALCHEMY_DATABASE_URI: str = 'dbname=scidatamanager user=postgres password=postgres host=scidatadb'
    
    class Config:
        env_file = ".env"
    
settings = Settings()