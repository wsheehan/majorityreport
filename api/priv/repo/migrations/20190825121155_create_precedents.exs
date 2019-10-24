defmodule MajorityReportApi.Repo.Migrations.CreatePrecedents do
  use Ecto.Migration

  def change do
    create table(:precedents) do
      add :description, :string
      add :name, :string
    end 
  end
end
