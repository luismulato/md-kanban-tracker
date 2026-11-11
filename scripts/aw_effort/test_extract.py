import unittest
from datetime import datetime, timedelta, timezone

from aw_effort import extract

T0 = datetime(2026, 10, 30, 10, 0, tzinfo=timezone.utc)


def ev(offset_s, dur_s, app="Code", title="a.ts — proj"):
    return {"timestamp": (T0 + timedelta(seconds=offset_s)).isoformat(),
            "duration": dur_s, "data": {"app": app, "title": title}}


class SplitTitle(unittest.TestCase):
    def test_archivo_y_carpeta(self):
        self.assertEqual(extract.split_title("opi-multi-idioma — opi-openside"),
                         ("opi-multi-idioma", "opi-openside"))

    def test_indicador_de_cambios_y_sufijo_del_editor(self):
        self.assertEqual(extract.split_title("● a.ts — proj — Visual Studio Code"),
                         ("a.ts", "proj"))

    def test_sin_separador_no_hay_carpeta(self):
        self.assertEqual(extract.split_title("Google Chrome"), ("Google Chrome", None))


class Blocks(unittest.TestCase):
    def test_puentea_huecos_menores_al_limite(self):
        blocks = extract.build_blocks([ev(0, 60), ev(120, 60)], max_gap_s=300)
        self.assertEqual(len(blocks), 1)
        self.assertEqual(blocks[0].active_s, 120)   # el hueco no suma como activo
        self.assertEqual(blocks[0].span_s, 180)

    def test_no_puentea_huecos_mayores(self):
        blocks = extract.build_blocks([ev(0, 60), ev(1000, 60)], max_gap_s=300)
        self.assertEqual(len(blocks), 2)

    def test_no_mezcla_carpetas_distintas(self):
        blocks = extract.build_blocks([ev(0, 60, title="a — p1"), ev(60, 60, title="a — p2")], 300)
        self.assertEqual({b.workspace for b in blocks}, {"p1", "p2"})

    def test_eventos_desordenados(self):
        blocks = extract.build_blocks([ev(120, 60), ev(0, 60)], max_gap_s=300)
        self.assertEqual(len(blocks), 1)


class Summary(unittest.TestCase):
    def test_minutos_por_app_y_carpeta(self):
        blocks = extract.build_blocks([ev(0, 120), ev(200, 60, app="Google Chrome", title="Botpress")], 60)
        rows = extract.summarize(blocks)
        self.assertEqual(rows[("Code", "proj")], 2.0)
        self.assertEqual(rows[("Google Chrome", None)], 1.0)


if __name__ == "__main__":
    unittest.main()
