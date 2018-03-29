defmodule HangmanWeb.GamesChannel do
  use HangmanWeb, :channel

  alias Hangman.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = Hangman.GameBackup.load(name) || Game.new()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_in("new", payload, socket) do
    game = Game.new(payload["name"])
    Hangman.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => game}}, socket}
  end

  def handle_in("player_join", %{"username" => username}, socket) do
    game = Game.player_join(socket.assigns[:game], username)
    Hangman.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => game}}, socket}
    broadcast socket, "shout", %{"game" => game}
  end

  def handle_in("answer", %{"answer" => answer, "user" => user}, socket) do
    game = Game.answer(socket.assigns[:game], answer, user)
    Hangman.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => game}}, socket}
    broadcast socket, "shout", %{"game" => game}
  end

  def handle_in("click", %{"id" => id, "user" => user}, socket) do
    game = Game.click(socket.assigns[:game], id, user)
    Hangman.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => game}}, socket}
    broadcast socket, "shout", %{"game" => game}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
