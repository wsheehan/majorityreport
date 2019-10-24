defmodule MajorityReportApi.Repo.Migrations.CreateInvalidsMarkets do
  use Ecto.Migration

  def change do
    create table(:precedents_markets) do
      add :precedent_id, references(:precedents, on_delete: :delete_all)
      add :market_id, references(:markets, type: :string, on_delete: :delete_all)
    end

    create unique_index(:precedents_markets, [:precedent_id, :market_id])
  end
end
