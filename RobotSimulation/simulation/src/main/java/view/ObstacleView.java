package main.java.view;

import javafx.scene.canvas  .GraphicsContext;
import javafx.scene.paint.Color;
import main.java.model.common.Obstacle;
import main.java.model.common.Position;

/**
 * View class for the Obstacle
 */
public class ObstacleView {
    private static final int OBSTACLE_SIZE = 20;

    /**
     * Draw the obstacle
     * @param obstacle the obstacle to draw
     * @param gc the graphics context to draw on
     */
    public void draw(Obstacle obstacle, GraphicsContext gc) {
        Position position = obstacle.getPosition();

        double x = position.getX();
        double y = position.getY();

        gc.setFill(Color.BLACK);


        gc.fillRect(x - (double) OBSTACLE_SIZE / 2, y - (double) OBSTACLE_SIZE / 2, OBSTACLE_SIZE, OBSTACLE_SIZE);

    }
}