defmodule MajorityReportApi.PrecedentController do
  import Ecto.Query

  alias MajorityReportApi.Repo
  alias MajorityReportApi.Market
  alias MajorityReportApi.Precedent

  def index(_) do
    market_query = from m in Market, select: map(m, [:id])

    query = from p in Precedent,
      preload: [markets: ^market_query],
      select: map(p, [:description, :id, :name, markets: [:id]])

    Repo.all(query) |> Enum.map(&update_to_count/1)
  end

  def get(%{path_params: path_params}) do
    query = from m in Market, select: map(m, [:id])

    case Repo.get(Precedent, path_params["id"]) |> Repo.preload([markets: query]) do
      nil -> %{}
      m -> Map.take(m, [:id, :name, :description, :markets])
    end
  end

  defp update_to_count(precedent) do
    Map.update!(precedent, :markets, &(length(&1)))
  end
end