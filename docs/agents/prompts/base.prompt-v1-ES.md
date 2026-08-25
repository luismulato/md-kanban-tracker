Todas las features, refactors o alteraciones en la base de código deben seguir el siguiente paso a paso:

1 - Análisis de la feature o alteración solicitada y verificar si ya está implementada o si condice con la realidad del proyecto. En otras palabras, verificar si la feature o alteración tiene sentido de acuerdo con la base de código actual.
1.1 - En caso de alteración o nueva feature, primero reproducir lo que deseamos mediante un test unitario de cómo se espera el comportamiento (1 archivo por feature). Es decir, trabajamos con TDD (Test Driven Development) siempre que sea posible. En caso de que sea una excepción, solicitar aprobación previa.
1.2 - Después de escribir el test, dejarlo fallar, ya que aún no tenemos la implementación.
1.3 - Planificar e implementar la feature, siguiendo buenas prácticas, la estructura que tenemos, sin exceso de comentarios (preferible clean code antes que muchos comentarios; si hay comentario, siempre conciso, solo una línea en minúsculas).
1.4 - Todo lo que se cree debe estar componentizado, siguiendo la estructura actual que tenemos, atomic design, test unitario de los nuevos componentes y features.
1.5 - Después de implementar la feature, correr el test nuevamente y, en caso de éxito, revisar si no faltó ningún detalle. Si todo está correcto, verificar el README.md o documentación relacionada para ver si es necesario actualizar algo relacionado a la nueva feature o alteración.
1.6 - Actualizar la documentación del proyecto, si es necesario, para reflejar los cambios realizados.
1.7 - Registrar las alteraciones en el changelog del proyecto (a menos que sea una alteración trivial).
1.8 - Avanzar a la próxima feature o alteración mapeada.
1.9 - Al final, hacer una revisión general del código para garantizar que todo esté en conformidad con los estándares del proyecto antes de someterlo a revisión de código (code review).
1.10 - Devolver un resumen de las alteraciones realizadas, incluyendo enlaces a los tests unitarios y documentación actualizada, si aplica.
