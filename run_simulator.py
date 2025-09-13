from exchange.classes.MarketSimulator import MarketSimulator

def test_market_simulator():
    simulator = MarketSimulator(base_price=100.0, growth_rate=0.001, sentiment=0.01, candle_interval=5)
    candles = []

    for _ in range(20):
        candle = simulator.simulate_tick()
        if candle:
            candles.append(candle)

    # print values
    for i, candle in enumerate(candles):
        print(f"Candle {i+1}: {candle}")

    assert len(candles) == 4  # 20 ticks with candle every 5 ticks
    for candle in candles:
        assert "open" in candle
        assert "high" in candle
        assert "low" in candle
        assert "close" in candle
        assert candle["high"] >= candle["low"]
        assert candle["open"] >= candle["low"]
        assert candle["close"] <= candle["high"]

    print("MarketSimulator test passed.")

if __name__ == "__main__":
    test_market_simulator()