defmodule MajorityReportApi.Repo.Migrations.CreateMarkets do
  use Ecto.Migration

  def change do
    create table(:markets, primary_key: false) do
      add :id, :string, primary_key: true
      add :description, :string
    end
  end
end
