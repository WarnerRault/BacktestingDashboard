from datetime import datetime
from time import perf_counter

import numpy as np
import vectorbt as vbt

from show_calculation_site import start_website

# Settings
CREATE_NEW_TAB_ON_RUN = False
PAIR = "BTC-USD"
TIMEFRAME = "1D"
ENTRY_FEE = 0.0001
TP_FEE = 0.0001
SL_FEE = 0.0004
SLIPPAGE = 0.0002
STARTING_CAPITAL = 100_000
R_MODE = "dollar"  # "dollar" or "percent"
R_VALUE = 2000  # 2% risk per trade or 2 cents risk per trade
R_FEE_CUTOFF = 0.4  # If total fees exceed 20% of R, skip the trade
START_DATE = "2021-01-01"
END_DATE = "2025-12-31"
STOP_LOSS_SWEEP_UNIT = "RR" # %, ATR, RR
TAKE_PROFIT_SWEEP_UNIT = "% OF BOX" # %, ATR, RR
STOP_LOSS_SWEEP_ARRAY = np.arange(10, 101, 2) 
TAKE_PROFIT_SWEEP_ARRAY = np.arange(10, 101, 5) 


def run_backtest():
    started_at = perf_counter()
    close = vbt.YFData.download(PAIR, start=START_DATE, end=END_DATE).get("Close")

    ma = vbt.MA.run(
        close,
        window=STOP_LOSS_SWEEP_ARRAY,
    )
    entries = close.vbt.crossed_above(ma.ma)
    exits = close.vbt.crossed_below(ma.ma)

    portfolio = vbt.Portfolio.from_signals(
        close,
        entries,
        exits,
        init_cash=STARTING_CAPITAL,
        fees=ENTRY_FEE,
        slippage=SLIPPAGE,
        freq=TIMEFRAME,
    )

    total_return = portfolio.total_return()
    best_window = total_return.idxmax()
    best_return = float(total_return.loc[best_window])
    trades_per_variation = portfolio.trades.count()
    trade_count = int(trades_per_variation.loc[best_window])
    total_trade_count = int(trades_per_variation.sum())
    win_rate = float(portfolio.trades.win_rate().loc[best_window])
    elapsed_seconds = round(perf_counter() - started_at, 2)

    return {
        
        "pair": PAIR,
        "timeFrame": TIMEFRAME,
        "testTime": elapsed_seconds,
        "numberOfSystems": int(len(total_return)),
        "numberOfTradesTotal": total_trade_count,
        "timeStamp": datetime.now().strftime("%B %#d, %Y %H:%M:%S"),
        "entryFee": ENTRY_FEE,
        "tpFee": TP_FEE,
        "slFee": SL_FEE,
        "slippage": SLIPPAGE,
        "startingCapital": STARTING_CAPITAL,
        "R": R_VALUE,
        "rMode": R_MODE,
        "feeCutoff": R_FEE_CUTOFF,
        "startDate": START_DATE,
        "endDate": END_DATE,
        "stopLossSweepUnit": STOP_LOSS_SWEEP_UNIT,
        "takeProfitSweepUnit": TAKE_PROFIT_SWEEP_UNIT,
        "stopLossSweepArray": STOP_LOSS_SWEEP_ARRAY.tolist(),
        "takeProfitSweepArray": TAKE_PROFIT_SWEEP_ARRAY.tolist(),
        "bestMaWindow": int(best_window),
        "bestFastWindow": int(best_window),
        "bestSlowWindow": None,
        "bestReturn": best_return,
        "numberOfTrades": trade_count,
        "numberOfLongs": trade_count,
        "numberOfShorts": 0,
        "winRate": win_rate,
    }


if __name__ == "__main__":
    data = run_backtest()
    start_website(data, create_new_tab_on_run=CREATE_NEW_TAB_ON_RUN)
