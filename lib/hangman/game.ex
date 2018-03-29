defmodule Hangman.Game do
  def new() do
    %{
      board: [
        "","","","","","","",
        "","","","","","","",
        "","","","","","","",
        "","","","","","","",
        "","","","","","","",
        "","","","","","",""
        ],
        questions: [
          "43 * 10", "61 * 10", "90 * 8", "28 * 9", "45 * 10", "51 * 7", "58 * 3",
          "4 * 9", "76 * 6", "27 * 7", "90 * 2", "8 * 6", "88 * 8", "23 * 1",
          "90 * 8", "30 * 8", "94 * 4", "67 * 4", "24 * 10", "48 * 9", "66 * 4",
          "8 * 6", "50 * 10", "32 * 2", "12 * 3", "72 * 10", "72 * 1", "41 * 10",
          "42 * 10", "42 * 4", "78 * 9", "79 * 10", "43 * 2", "18 * 5", "60 * 6",
          "6 * 3", "65 * 4", "79 * 1", "64 * 10", "60 * 3", "80 * 7", "43 * 5"],
        answers: [
          "430", "610", "720", "252", "450", "357", "174",
          "36", "456", "189", "180", "48", "704", "23",
          "720", "240", "376", "268", "240", "432", "264",
          "48", "500", "64", "36", "720", "72", "410",
          "420", "168", "702", "790", "86", "90", "360",
          "18", "260", "79", "640", "180", "560", "215"],
        p1_currentQuestion: 0,
        p2_currentQuestion: 0,
        p1_clickDisabled: true,
        p2_clickDisabled: true,
        players: []
    }
  end

  def client_view(game) do
    #ws = String.graphemes(game.word)
    #gs = game.guesses
    %{
      #skel: skeleton(ws, gs),
      #goods: Enum.filter(gs, &(Enum.member?(ws, &1))),
      #bads: Enum.filter(gs, &(!Enum.member?(ws, &1))),
      #max: max_guesses(),
      board: game.board,
      questions: game.questions,
      answers: game.answers,
      p1_currentQuestion: game.p1_currentQuestion,
      p2_currentQuestion: game.p2_currentQuestion,
      p1_clickDisabled: game.p1_clickDisabled,
      p2_clickDisabled: game.p2_clickDisabled,
      players: game.players
    }
  end

  def player_join(game, username) do
      updatedPlayers = game.players ++ [username]
      Map.put(game, :players, Enum.uniq(updatedPlayers))
  end

  def click(game, id, user) do
    cond do
      user == Enum.at(game.players,0) ->
        if game.p1_clickDisabled == false do
          updatedBoard = List.replace_at(game.board, id, "0")
          game = Map.put(game, :board, updatedBoard)
          game = Map.put(game, :p1_clickDisabled , true)
          game = Map.put(game, :p1_currentQuestion, game.p1_currentQuestion + 1)
        else
          game
        end
      user == Enum.at(game.players,1) ->
        if game.p2_clickDisabled == false do
          updatedBoard = List.replace_at(game.board, id, "1")
          game = Map.put(game, :board, updatedBoard)
          game = Map.put(game, :p2_clickDisabled, true)
          game = Map.put(game, :p2_currentQuestion, game.p2_currentQuestion + 1)
        else
          game
        end
      true ->
        game
    end
  end

  def answer(game, answer, user) do
    cond do
      user == Enum.at(game.players,0) ->
          correct_ans = Enum.at(game.answers, game.p1_currentQuestion)
          if correct_ans == answer do
            Map.put(game, :p1_clickDisabled, false)
          else
            game
          end
      user == Enum.at(game.players,1) ->
          correct_ans = Enum.at(game.answers, game.p2_currentQuestion)
          if correct_ans == answer do
            Map.put(game, :p2_clickDisabled, false)
          else
            game
          end
      true ->
        game
    end
  end

  def skeleton(word, guesses) do
    Enum.map word, fn cc ->
      if Enum.member?(guesses, cc) do
        cc
      else
        "_"
      end
    end
  end

  def guess(game, letter) do
    if letter == "z" do
      raise "That's not a real letter"
    end

    gs = game.guesses
    |> MapSet.new()
    |> MapSet.put(letter)
    |> MapSet.to_list

    Map.put(game, :guesses, gs)
  end

  def max_guesses do
    10
  end

  def next_word do
    words = ~w(
      horse snake jazz violin
      muffin cookie pizza sandwich
      house train clock
      parsnip marshmallow
    )
    Enum.random(words)
  end
end
