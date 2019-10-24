defmodule Mix.Tasks.AddMarket do
  use Mix.Task

  alias MajorityReportApi.Repo
  alias MajorityReportApi.Market
  alias MajorityReportApi.Precedent

  @shortdoc "Adds market from cli"
  def run([market_id]) do
    # start the app so that Ecto is started
    Mix.Task.run "app.start"

    # # load and save precedents
    # {:ok, precedents} = load_json("data/precedents.json")

    # # load and save invalid markets
    {:ok, markets} = load_json("data/v1-invalid.json")
    case Enum.find(markets, fn x -> x.id == market_id end) do
      nil -> IO.puts("Could not find market in JSON")
      market -> Repo.save_market(market)
    end
    # IO.inspect(market)

    # Enum.map(v1_invalid_markets, &save_market/1)
  end

  defp load_json(filename) do
    with {:ok, body} <- File.read(filename),
         {:ok, json} <- Poison.decode(body, %{keys: :atoms!}), do: {:ok, json}
  end
end