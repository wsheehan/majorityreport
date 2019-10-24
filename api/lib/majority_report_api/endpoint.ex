defmodule MajorityReportApi.Endpoint do
  use Plug.Router

  alias MajorityReportApi.MarketController
  alias MajorityReportApi.PrecedentController

  origins = case Mix.env do
    :dev -> ["http://localhost:3000"]
    :prod -> ["https://themajority.report"]
  end
  
  plug Corsica, 
    origins: origins, 
    log: [rejected: :error], 
    allow_headers: ["content-type"]

  plug(:match)

  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Poison
  )

  plug(:dispatch)

  get "/precedents" do
    json = PrecedentController.index(conn) |> Poison.encode!

    conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, json)
  end

  get "/precedent/:id" do
    json = PrecedentController.get(conn) |> Poison.encode!

    conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, json)
  end

  get "/market/:id" do
    json = MarketController.get(conn) |> Poison.encode!

    conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, json)
  end


  match _ do
    send_resp(conn, 404, "Requested page not found!")
  end

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]}
    }
  end

  def start_link(_opts) do
    Plug.Cowboy.http(__MODULE__, [], port: get_port())
  end

  defp get_port() do
    port_env_variable = System.get_env("PORT")
    if is_nil(port_env_variable) do
      4000
    else
      String.to_integer(port_env_variable)
    end
  end
end