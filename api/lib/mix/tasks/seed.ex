defmodule Mix.Tasks.Seed do
  use Mix.Task

  alias MajorityReportApi.Repo
  alias MajorityReportApi.Market
  alias MajorityReportApi.Precedent

  @shortdoc "Seeds DB with data from json blobs"
  def run(_) do
    # start the app so that Ecto is started
    Mix.Task.run "app.start"

    # clear out DB
    Repo.delete_all(Precedent)
    Repo.delete_all(Market)

    # load and save precedents
    {:ok, precedents} = load_json("data/precedents.json")
    Enum.map(precedents, &save_precedent/1)

    # load and save invalid markets
    {:ok, v1_invalid_markets} = load_json("data/v1-invalid.json")
    Enum.map(v1_invalid_markets, &save_market/1)
  end

  def save_market(market) do
    precedents = Enum.map(market.precedents, &load_precedent/1)

    changeset = %Market{id: market.id}
      |> Repo.preload([:precedents])
      |> Ecto.Changeset.change
      |> Ecto.Changeset.put_assoc(:precedents, precedents)

    Repo.insert!(changeset)
  end

  defp load_precedent(id) do
    Repo.get(Precedent, id)
  end

  def save_precedent(precedent) do
    struct(%Precedent{}, precedent) |> Repo.insert
  end

  defp load_json(filename) do
    with {:ok, body} <- File.read(filename),
         {:ok, json} <- Poison.decode(body, %{keys: :atoms!}), do: {:ok, json}
  end
end